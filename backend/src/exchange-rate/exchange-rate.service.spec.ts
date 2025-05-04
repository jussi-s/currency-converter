// test/exchange-rate.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { ExchangeRateService } from "./exchange-rate.service";
import { REDIS_CLIENT } from "../redis/redis.constants";
import axios from "axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpException } from "@nestjs/common";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  ttl: jest.fn(),
};

const mockRates = [
  {
    base_currency: "USD",
    quote_currency: "EUR",
    quote: 0.9,
    date: "2025-01-01",
  },
  {
    base_currency: "USD",
    quote_currency: "GBP",
    quote: 0.8,
    date: "2025-01-01",
  },
];

describe("ExchangeRateService", () => {
  let service: ExchangeRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        ExchangeRateService,
        ConfigService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
        {
          provide: "PinoLogger:ExchangeRateService",
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
    jest.clearAllMocks();
  });

  it("should skip update if recently updated", async () => {
    mockRedis.set.mockResolvedValue(null);
    mockRedis.get.mockResolvedValue(new Date().toISOString());
    await service.updateExchangeRatesIfStale();
    expect(mockRedis.set).toHaveBeenCalledWith(
      "currency_rates_updating",
      "1",
      "EX",
      60,
      "NX"
    );
  });

  it("should fetch and cache rates if outdated", async () => {
    mockRedis.set.mockResolvedValue("OK");
    mockRedis.get.mockResolvedValueOnce(
      new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    );
    mockedAxios.get.mockResolvedValue({ data: mockRates });

    await service.updateExchangeRatesIfStale();
    expect(mockRedis.set).toHaveBeenCalledWith(
      "currency_rates",
      JSON.stringify(mockRates),
      "EX",
      3600
    );
    expect(mockRedis.set).toHaveBeenCalledWith(
      "currency_rates_last_updated_at",
      expect.any(String)
    );
  });

  it("should handle API fetch failure gracefully", async () => {
    mockRedis.set.mockResolvedValue("OK");
    mockRedis.get.mockResolvedValueOnce(
      new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    );
    mockedAxios.get.mockRejectedValue(new Error("API unavailable"));

    await expect(service.updateExchangeRatesIfStale()).resolves.not.toThrow();
    expect(mockRedis.set).not.toHaveBeenCalledWith(
      "currency_rates",
      expect.anything()
    );
  });

  it("should return exchange rates from cache", async () => {
    mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockRates));
    const result = await service.getExchangeRates();
    expect(result).toEqual(mockRates);
  });

  it("should return empty array when no cached rates exist", async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    const result = await service.getExchangeRates();
    expect(result).toEqual([]);
  });

  it("should return list of base currencies", async () => {
    mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockRates));
    const result = await service.getBaseCurrencies();
    expect(result).toEqual(["USD"]);
  });

  it("should return list of target currencies for a base currency", async () => {
    mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockRates));
    const result = await service.getTargetCurrencies("USD");
    expect(result).toEqual([
      { currency: "EUR", quote: 0.9, date: "2025-01-01" },
      { currency: "GBP", quote: 0.8, date: "2025-01-01" },
    ]);
  });

  it("should throw NotFoundException if no target currencies are found for given base", async () => {
    mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockRates));
    await expect(service.getTargetCurrencies("EUR")).rejects.toThrow(
      HttpException
    );
  });

  it("should return health status with last update time", async () => {
    const now = new Date();
    mockRedis.get.mockResolvedValueOnce(now.toISOString());
    const result = await service.getHealthStatus();
    expect(result.lastUpdated).toEqual(now.toISOString());
  });

  it("should return health status with null if no timestamp exists", async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    const result = await service.getHealthStatus();
    expect(result.lastUpdated).toBeNull();
  });

  it("should handle invalid JSON in Redis cache gracefully", async () => {
    mockRedis.get.mockResolvedValueOnce("{ invalid json }");
    const result = await service.getExchangeRates();
    expect(result).toEqual([]);
  });

  it("should not update if TTL exists on the lock key", async () => {
    mockRedis.set.mockResolvedValue(null); // failed to acquire lock
    mockRedis.get.mockResolvedValueOnce(null);
    await service.updateExchangeRatesIfStale();
    expect(mockRedis.set).toHaveBeenCalledWith(
      "currency_rates_updating",
      "1",
      "EX",
      60,
      "NX"
    );
  });

  it("should cache timestamp when rates are updated", async () => {
    mockRedis.set.mockResolvedValue("OK");
    mockRedis.get.mockResolvedValueOnce(null);
    mockedAxios.get.mockResolvedValue({ data: mockRates });

    await service.updateExchangeRatesIfStale();
    expect(mockRedis.set).toHaveBeenCalledWith(
      "currency_rates_last_updated_at",
      expect.any(String)
    );
  });
});
