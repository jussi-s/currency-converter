# Currency Converter Frontend

This is a modern, production-grade frontend for a currency converter, built with **React**, **TypeScript**, **Vite**, and **CSS Modules**. It consumes a secure NestJS backend and supports real-time conversion of currencies with multilingual support (English 🇬🇧 + German 🇩🇪).

---

## Features

- Internationalization with `react-i18next` (English, German)
- Dropdowns for base and target currencies
- Live amount input and result display
- CSRF-safe API interaction via a production-ready `apiFetch` wrapper
- Quote display per conversion
- Environment-based API configuration
- CSS Modules + clean component structure
- Unit tests with Jest + React Testing Library
- Vite for fast builds and dev server

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A running instance of the backend at `http://localhost:3000` (full setup instructions on the top-level README)

### Setup

```bash
cd frontend
npm install
```

### Run locally

```
npm run dev
```

After this, visit: http://localhost:5173
