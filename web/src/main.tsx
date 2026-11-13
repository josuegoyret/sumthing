import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./App.tsx";
import { apiUrl } from "./config";
import { createHttpCalculator, warmUp } from "./httpCalculator";

if (!apiUrl) {
  throw new Error("Set VITE_API_URL to the calculator API URL.");
}

// Runs once per app load, not once per mount, so it lives outside React.
// https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
warmUp(apiUrl);
const client = createHttpCalculator(apiUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App client={client} />
  </StrictMode>,
);
