import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

export function Doc_GetCurrencies() {
  return applyDecorators(
    ApiOperation({ summary: "Get supported base currencies" }),
    ApiResponse({
      status: 200,
      description: "List of unique base currencies (e.g. USD, EUR)",
    })
  );
}

export function Doc_GetTargetCurrencies() {
  return applyDecorators(
    ApiOperation({ summary: "Get quote currencies for a given base currency" }),
    ApiQuery({
      name: "baseCurrency",
      required: true,
      description: "The base currency code (e.g. USD)",
      example: "USD",
    }),
    ApiResponse({
      status: 200,
      description: "List of quote currencies with exchange rates",
    }),
    ApiResponse({
      status: 400,
      description: "Missing or invalid query parameter",
    }),
    ApiResponse({
      status: 404,
      description:
        "Base currency not supported or not found in available exchange rates",
    })
  );
}

export function Doc_GetExchangeRates() {
  return applyDecorators(
    ApiOperation({ summary: "Get all exchange rate entries" }),
    ApiResponse({
      status: 200,
      description:
        "Full list of exchange rate objects from cache or swop.cx API",
    })
  );
}

export function Doc_GetHealth() {
  return applyDecorators(
    ApiOperation({ summary: "Health check and cache status" }),
    ApiResponse({
      status: 200,
      description: "Returns Redis cache freshness and last update time",
      schema: {
        example: {
          status: "ok",
          lastUpdated: "2025-05-02T15:00:00.000Z",
          expiresInSeconds: 2950,
        },
      },
    })
  );
}

export function Doc_ForceCacheUpdate() {
  return applyDecorators(
    ApiOperation({
      summary: "Force currency cache update",
      description:
        "Triggers a manual fetch and refresh of exchange rates. Use with caution.",
    }),
    ApiResponse({
      status: 200,
      description: "Exchange rates were refreshed and Redis cache was updated.",
    })
  );
}
