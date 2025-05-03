import { LoggerModuleAsyncParams } from "nestjs-pino";

export const loggerConfig: LoggerModuleAsyncParams = {
  useFactory: async () => ({
    pinoHttp: {
      level: process.env.LOG_LEVEL || "info",
    },
  }),
};
