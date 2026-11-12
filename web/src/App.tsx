import "./App.css";
import type { CalculatorClient } from "./calculatorClient";
import Calculator from "./components/Calculator";

type AppProps = {
  client: CalculatorClient;
};

export default function App({ client }: AppProps) {
  return (
    <main className="app">
      <header className="app-header">
        <svg className="app-logo" viewBox="0 0 32 32" aria-hidden="true">
          <rect className="app-logo-tile" width="32" height="32" rx="8" />
          <path className="app-logo-sigma" d="M22 9H10l7 7-7 7h12" />
        </svg>
        <h1 className="app-name">sumthing</h1>
      </header>
      <Calculator client={client} />
    </main>
  );
}
