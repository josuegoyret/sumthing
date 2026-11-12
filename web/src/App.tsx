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
          <path d="M22 9H10l7 7-7 7h12" />
        </svg>
        <span className="app-name">sumthing</span>
      </header>
      <Calculator client={client} />
    </main>
  );
}
