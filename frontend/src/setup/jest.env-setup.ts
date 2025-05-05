Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: "http://localhost:3000",
        // Add other env vars used in tests
      },
    },
  },
});
