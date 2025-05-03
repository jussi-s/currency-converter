import { Controller, Get, Post, Query } from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import {
  Doc_ForceCacheUpdate,
  Doc_GetCurrencies,
  Doc_GetExchangeRates,
  Doc_GetHealth,
  Doc_GetTargetCurrencies,
} from "./exchange-rate.swagger";
import { BaseCurrencyQueryDto } from "./dto/base-query.dto";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Controller("api")
export class ExchangeRateController {
  constructor(
    private readonly exchangeRateService: ExchangeRateService,
    @InjectPinoLogger(ExchangeRateController.name)
    private readonly logger: PinoLogger
  ) {}

  @Doc_GetCurrencies()
  @Get("currencies")
  async getCurrencies() {
    return this.exchangeRateService.getBaseCurrencies();
  }

  @Doc_GetTargetCurrencies()
  @Get("target-currencies")
  async targetCurrencies(@Query() query: BaseCurrencyQueryDto) {
    return this.exchangeRateService.getTargetCurrencies(query.baseCurrency);
  }

  @Doc_GetExchangeRates()
  @Get("exchange-rates")
  async exchangeRates() {
    return this.exchangeRateService.getExchangeRates();
  }

  @Doc_ForceCacheUpdate()
  @Post("force-update-cache")
  async forceCacheUpdate() {
    this.exchangeRateService.updateExchangeRates();
  }

  @Doc_GetHealth()
  @Get("health")
  async getHealth() {
    this.logger.info("Health endpoint hit");
    return this.exchangeRateService.getHealthStatus();
  }
}
