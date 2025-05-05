import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { setupSwagger } from "./config/swagger.config";
import { applySecurityMiddleware } from "./security/security.middleware";
import { corsOptions } from "./config/cors.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  applySecurityMiddleware(app);
  setupSwagger(app);
  app.enableCors(corsOptions);
  await app.listen(3000);
}

bootstrap();
