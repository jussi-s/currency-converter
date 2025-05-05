# Currency Converter Backend

This is a NestJS backend for a currency conversion microservice. It fetches exchange rates from [swop.cx](https://swop.cx), stores them in Redis, and exposes APIs to retrieve base currencies, target currencies, and perform conversions. It also includes structured logging, security features, and full test coverage.

## Features

- Daily exchange rate updates from [swop.cx](https://swop.cx)
- Redis caching with concurrency-safe refreshes
- RESTful API with Swagger documentation (`/docs`)
- CSRF protection and Content Security Policy headers
- Structured logging with `nestjs-pino`
- Integration tests with Jest + Supertest
- Docker support (app + Redis)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker (for Redis)
- Redis running (or use `docker-compose`)

### Build

```bash
cd backend
npm run build
```

### Run Redis with Docker

```bash
docker-compose up -d redis
```

Or run manually:

```bash
docker run --name redis-cache -p 6379:6379 -d redis:7
```

### Environment Variables

Create a `.env` file:

```env
SWOP_API_KEY=your_swop_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGINS=http://localhost:5173
```

**Note:** Do not commit `.env` to version control.

## Scripts

| Command            | Description          |
| ------------------ | -------------------- |
| `npm run start`    | Run the application  |
| `npm run lint`     | Run ESLint           |
| `npm test`         | Run all tests        |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Test coverage report |

---

## Security

- CSRF tokens are generated and validated using cookies + headers
- CSP headers limit script sources
- Best used behind a reverse proxy like NGINX

---

## Testing

Jest is used for both unit and integration tests. CSRF tokens and Redis are mocked in integration tests for consistent results.

To run tests:

```bash
npm test
```

To view test coverage:

```bash
npm run test:cov
```

## API Docs

Swagger UI is available at:

```
http://localhost:3000/docs
```
