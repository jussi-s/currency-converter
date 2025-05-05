import styles from "./App.module.css";
import CurrencyConverter from "./components/CurrencyConverter";

export default function App() {
  return (
    <div className={styles.app}>
      <CurrencyConverter />
    </div>
  );
}
