import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExchangeRateController } from "./exchange-rate/exchange-rate.controller";
import { ExchangeRateService } from "./exchange-rate/exchange-rate.service";
import { RedisProvider } from "./redis/redis.provider";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule } from "nestjs-pino";
import { loggerConfig } from "./config/logger.config";
import { SecurityController } from "./security/security.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    LoggerModule.forRootAsync(loggerConfig),
  ],
  controllers: [ExchangeRateController, SecurityController],
  providers: [ExchangeRateService, RedisProvider],
})
export class AppModule {}
