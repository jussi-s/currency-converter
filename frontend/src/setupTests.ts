import "@testing-library/jest-dom";

jest.mock("@/config/env", () => ({
  API_BASE_URL: "http://localhost:3000",
}));

jest.mock("@/i18n", () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
    changeLanguage: jest.fn(),
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));
