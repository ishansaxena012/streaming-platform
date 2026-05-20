import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AppProviders } from "../providers";
import { GlobalErrorBoundary } from "../components/errors/global-error-boundary";

export function App() {
  return (
    <GlobalErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </GlobalErrorBoundary>
  );
}
export default App;
