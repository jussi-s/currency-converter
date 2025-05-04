import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import fs from "fs";

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Currency Converter API")
    .setDescription("API for querying currency exchange rates")
    .setVersion("1.0")
    .addTag("Exchange Rates")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  fs.writeFileSync("./openapi.json", JSON.stringify(document, null, 2));
}
