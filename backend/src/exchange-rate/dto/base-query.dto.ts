import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BaseCurrencyQueryDto {
  @IsString()
  @Length(3, 3, { message: "Base currency must be a 3-letter code" })
  @ApiProperty({
    example: "EUR",
    description: "Base currency code (3 letters)",
  })
  baseCurrency!: string;
}
