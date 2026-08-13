#!/bin/sh

# parameters
destination=""
port=""
environment=""
keepDays="7"

print_help () {
    echo ""
    echo "Usage: sh clean.sh [OPTIONS]"
    echo ""
    echo "Clean old CDN files for mutable environments."
    echo ""
    echo "Options:"
    echo "  -d, --destination (mandatory)"
    echo "  -p, --port (Default value: 22)"
    echo "  -e, --environment main|INT|pr (mandatory)"
    echo "  -k, --keep-days (Default value: 7, only for pr)"
    echo "  -h, --help"
    echo ""
    echo "Examples:"
    echo "  sh clean.sh --port=22 --destination=cdndoppler@reporting.fromdoppler.com:/cdndoppler/hello-webapp/ --environment=main"
    echo "  sh clean.sh --port=22 --destination=cdndoppler@reporting.fromdoppler.com:/cdndoppler/hello-webapp/ --environment=pr --keep-days=7"
}

for i in "$@" ; do
case $i in
    -d=*|--destination=*)
    destination="${i#*=}"
    ;;
    -p=*|--port=*)
    port="${i#*=}"
    ;;
    -e=*|--environment=*)
    environment="${i#*=}"
    ;;
    -k=*|--keep-days=*)
    keepDays="${i#*=}"
    ;;
    -h|--help)
    print_help
    exit 0
    ;;
esac
done

if [ -z "${destination}" ]
then
  echo "Error: destination parameter is mandatory"
  print_help
  exit 1
fi

if [ -z "${port}" ]
then
  port=22
fi

if [ -z "${environment}" ]
then
  echo "Error: environment parameter is mandatory"
  print_help
  exit 1
fi

case "${environment}" in
  main|INT|pr)
    ;;
  *)
    echo "Error: environment must be one of: main, INT, pr"
    print_help
    exit 1
    ;;
esac

case "${keepDays}" in
  ''|*[!0-9]*)
    echo "Error: keep-days must be a positive integer"
    print_help
    exit 1
    ;;
  0)
    echo "Error: keep-days must be greater than zero"
    print_help
    exit 1
    ;;
esac

# Stop script on NZEC
set -e
# Stop script if unbound variable found (use ${var:-} if intentional)
set -u

# Lines added to get the script running in the script path shell context
# reference: http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
cd "$(dirname "$0")"

# To avoid issues with MINGW and Git Bash, see:
# https://github.com/docker/toolbox/issues/673
# https://gist.github.com/borekb/cb1536a3685ca6fc0ad9a028e6a959e3
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL="*"

echo "Starting CDN cleanup for ${environment} at ${destination#*:}..."

quote_for_remote_shell () {
  printf "'%s'" "$(printf "%s" "$1" | sed "s/'/'\\\\''/g")"
}

localRemoteScript="$(mktemp)"
remoteBasePath="${destination#*:}"
remoteScript="${remoteBasePath%/}/.hello-webapp-cdn-clean-$$.sh"
trap 'rm -f "${localRemoteScript}"' EXIT

cat > "${localRemoteScript}" <<'REMOTE_SCRIPT'
set -e
set -u

CDN_CLEAN_PATH="$1"
CDN_CLEAN_ENVIRONMENT="$2"
CDN_CLEAN_KEEP_DAYS="$3"
CDN_CLEAN_SCRIPT="$4"

trap 'rm -f "${CDN_CLEAN_SCRIPT}"' EXIT

cd "${CDN_CLEAN_PATH}"

echo "Scanning CDN manifests in ${CDN_CLEAN_PATH} for ${CDN_CLEAN_ENVIRONMENT} cleanup..."

tmpDir="$(mktemp -d)"
trap 'rm -rf "${tmpDir}"' EXIT

allManifests="${tmpDir}/all-manifests"
deleteManifests="${tmpDir}/delete-manifests"
keepManifests="${tmpDir}/keep-manifests"
candidateAssets="${tmpDir}/candidate-assets"
protectedAssets="${tmpDir}/protected-assets"
deletableAssets="${tmpDir}/deletable-assets"

: > "${allManifests}"
: > "${deleteManifests}"
: > "${candidateAssets}"
: > "${protectedAssets}"
: > "${deletableAssets}"

find . -maxdepth 1 -type f -name 'asset-manifest-*.json' -print \
  | sed 's#^\./##' \
  | sort > "${allManifests}"

if [ "${CDN_CLEAN_ENVIRONMENT}" = "pr" ]
then
  find . -maxdepth 1 -type f -name 'asset-manifest-pr-*.json' -mtime +"${CDN_CLEAN_KEEP_DAYS}" -print \
    | sed 's#^\./##' \
    | sort > "${deleteManifests}"
else
  latestEnvironmentManifest="$(
    ls -t "asset-manifest-${CDN_CLEAN_ENVIRONMENT}"-*.json 2>/dev/null \
      | sed -n '1p'
  )"

  find . -maxdepth 1 -type f -name "asset-manifest-${CDN_CLEAN_ENVIRONMENT}-*.json" -print \
    | sed 's#^\./##' \
    | sort \
    | while IFS= read -r manifest
      do
        if [ "${manifest}" != "${latestEnvironmentManifest}" ]
        then
          printf '%s\n' "${manifest}"
        fi
      done > "${deleteManifests}"
fi

if [ ! -s "${deleteManifests}" ]
then
  echo "No old CDN manifests found for ${CDN_CLEAN_ENVIRONMENT}."
  exit 0
fi

extract_manifest_assets () {
  manifest="$1"

  if command -v jq >/dev/null 2>&1
  then
    jq -r '.files | values[]?' "${manifest}"
  else
    sed -n 's#.*\(static/\(css\|js\)/[^"]*\).*#\1#p' "${manifest}"
  fi \
    | sed -n 's#^.*\(static/\(css\|js\)/[^?#]*\).*$#\1#p' \
    | sort -u
}

grep -F -x -v -f "${deleteManifests}" "${allManifests}" > "${keepManifests}" || true

while IFS= read -r manifest
do
  [ -f "${manifest}" ] || continue
  extract_manifest_assets "${manifest}" >> "${candidateAssets}"
done < "${deleteManifests}"

while IFS= read -r manifest
do
  [ -f "${manifest}" ] || continue
  extract_manifest_assets "${manifest}" >> "${protectedAssets}"
done < "${keepManifests}"

sort -u "${candidateAssets}" -o "${candidateAssets}"
sort -u "${protectedAssets}" -o "${protectedAssets}"

grep -F -x -v -f "${protectedAssets}" "${candidateAssets}" > "${deletableAssets}" || true

deletedAssetsCount=0
while IFS= read -r asset
do
  case "${asset}" in
    static/css/*|static/js/*)
      if [ -f "${asset}" ]
      then
        rm -f "${asset}"
        deletedAssetsCount=$((deletedAssetsCount + 1))
      fi
      ;;
  esac
done < "${deletableAssets}"

deletedManifestsCount=0
while IFS= read -r manifest
do
  if [ -f "${manifest}" ]
  then
    rm -f "${manifest}"
    deletedManifestsCount=$((deletedManifestsCount + 1))
  fi
done < "${deleteManifests}"

echo "Deleted ${deletedManifestsCount} old CDN manifests and ${deletedAssetsCount} unreferenced manifest assets for ${CDN_CLEAN_ENVIRONMENT}."
REMOTE_SCRIPT

scp -P "${port}" "${localRemoteScript}" "${destination%:*}:${remoteScript}"

remoteScriptArgument="$(quote_for_remote_shell "${remoteScript}")"
remotePathArgument="$(quote_for_remote_shell "${destination#*:}")"
remoteEnvironmentArgument="$(quote_for_remote_shell "${environment}")"
remoteKeepDaysArgument="$(quote_for_remote_shell "${keepDays}")"

ssh -p "${port}" "${destination%:*}" "\
  sh ${remoteScriptArgument} \
    ${remotePathArgument} \
    ${remoteEnvironmentArgument} \
    ${remoteKeepDaysArgument} \
    ${remoteScriptArgument}"

echo "Finished CDN cleanup for ${environment}."
