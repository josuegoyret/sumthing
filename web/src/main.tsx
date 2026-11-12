import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./App.tsx";
import { apiUrl, isDevelopment } from "./config";
import { createHttpCalculator } from "./httpCalculator";

async function loadCalculatorClient() {
  if (apiUrl) return createHttpCalculator(apiUrl);
  if (!isDevelopment) {
    throw new Error("Set VITE_API_URL to the calculator API URL.");
  }
  const { mockCalculator } = await import("./mockCalculator");
  return mockCalculator;
}

const client = await loadCalculatorClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App client={client} />
  </StrictMode>,
);
