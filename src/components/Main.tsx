import { Outlet } from "react-router-dom";
import "./Main.css";

export const mainTestId = "outlet-test-id";

export function Main() {
  return (
    <div className="App" data-testid={mainTestId}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
