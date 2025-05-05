import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang); // Optional: persist language
  };

  return (
    <div className={styles.switcher}>
      <button
        onClick={() => changeLanguage("en")}
        className={i18n.language === "en" ? styles.active : ""}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("de")}
        className={i18n.language === "de" ? styles.active : ""}
      >
        DE
      </button>
    </div>
  );
}
