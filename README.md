# Currency Converter

This is a simple currency converter which accepts base/target currencies and an amount to convert.

## Build and run the application

1. Build and start the backend service. Follow the setup starting from the Build section at the [backend README](https://github.com/jussi-s/currency-converter/blob/main/backend/README.md).

- Open the backend directory in a terminal (`cd backend`)
- Build the application (`npm run build`)
- Start the Redis Docker container (`docker run --name redis-cache -p 6379:6379 -d redis:7`)
- Set-up environment variables as .env file in the backend directory (for this, you need to have a swop.cx API token - it is free to register):

```
SWOP_API_KEY=your_swop_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGINS=http://localhost:5173
```

- Start the backend (`npm run start`)

2. Build and start the front-end:

- Open the frontend directory in a new terminal (`cd frontend`)
- Run `npm install`
- Create an .env file in the frontend directory, containing the following environment variable:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

- Start the frontend `npm run dev`
- You can now use the converter by visiting http://localhost:5173

## Additional Features + CSRF

With the current setup, the cache should be always up to date (daily cache refresh).

However, there is a POST /api/force-update-cache endpoint, which is possible to call if a valid CSRF token is provided:

1. First, fetch a CSRF token using the GET /api/csrf-token
2. From the response of the above, call POST /api/force-update-cache using header X-CSRF-TOKEN: <csrf-token-value>
