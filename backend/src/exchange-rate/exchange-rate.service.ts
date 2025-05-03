import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import axios from "axios";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { tryAcquireRedisLock } from "../utils/redis-lock";
import { REDIS_CLIENT } from "../redis/redis.constants";

interface ExchangeRate {
  base_currency: string;
  quote_currency: string;
  quote: number;
  date: string;
}

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly rateKey = "currency_rates";
  private readonly updatedAtKey = "currency_rates_last_updated_at";
  private readonly lockKey = "currency_rates_updating";

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
    @InjectPinoLogger(ExchangeRateService.name)
    private readonly logger: PinoLogger
  ) {}

  async updateExchangeRates(): Promise<void> {
    const token = this.configService.get<string>("SWOP_API_TOKEN");
    if (!token) throw new Error("Missing SWOP_API_TOKEN");

    try {
      const response = await axios.get("https://swop.cx/rest/rates/", {
        headers: { Authorization: `ApiKey ${token}` },
      });

      const rates = response.data;
      await this.redis.set(this.rateKey, JSON.stringify(rates), "EX", 3600);
      await this.redis.set(this.updatedAtKey, new Date().toISOString());

      this.logger.info("Exchange rates updated and cached successfully");
    } catch (err) {
      this.logger.error({ err }, "Failed to fetch or cache exchange rates");
    }
  }

  async updateExchangeRatesIfStale(): Promise<void> {
    try {
      const lockAcquired = await tryAcquireRedisLock(
        this.redis,
        this.lockKey,
        60
      );
      if (!lockAcquired) {
        this.logger.info("Another instance is updating rates. Skipping.");
        return;
      }

      const lastUpdatedRaw = await this.redis.get(this.updatedAtKey);
      if (lastUpdatedRaw) {
        const lastUpdated = new Date(lastUpdatedRaw);
        const now = new Date();
        const hoursSince =
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (hoursSince < 24) {
          this.logger.info(
            `Rates updated ${hoursSince.toFixed(2)}h ago. Skipping.`
          );
          return;
        }
      } else {
        this.logger.info(
          "No update timestamp found. Proceeding to fetch new rates."
        );
      }

      await this.updateExchangeRates();
    } catch (err) {
      this.logger.error({ err }, "Failed updating stale exchange rates.");
    }
  }

  async onModuleInit() {
    this.logger.info("Initializing exchange rate cache...");
    await this.updateExchangeRatesIfStale();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refreshHourly() {
    return this.updateExchangeRatesIfStale();
  }

  async getExchangeRates(): Promise<ExchangeRate[]> {
    const data = await this.redis.get(this.rateKey);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch (err) {
      this.logger.warn("Failed to parse cached exchange rates", err);
      return [];
    }
  }

  async getBaseCurrencies(): Promise<string[]> {
    const rates = await this.getExchangeRates();
    const baseCurrencies = new Set(rates.map((rate) => rate.base_currency));
    return Array.from(baseCurrencies);
  }

  async getTargetCurrencies(
    baseCurrency: string
  ): Promise<{ currency: string; quote: number; date: string }[]> {
    const rates = await this.getExchangeRates();

    const targets = rates
      .filter((rate) => rate.base_currency === baseCurrency)
      .map((rate) => ({
        currency: rate.quote_currency,
        quote: rate.quote,
        date: rate.date,
      }));

    if (targets.length === 0) {
      throw new HttpException(
        `No quote currencies found for base currency: ${baseCurrency}`,
        HttpStatus.NOT_FOUND
      );
    }

    return targets;
  }

  async getHealthStatus() {
    const lastUpdated = await this.redis.get(this.updatedAtKey);
    const cacheExpiry = await this.redis.ttl(this.rateKey);

    return {
      status: lastUpdated ? "ok" : "stale",
      lastUpdated,
      expiresInSeconds: cacheExpiry,
    };
  }
}
