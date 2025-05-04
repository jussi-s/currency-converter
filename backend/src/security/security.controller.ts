import { Controller, Get, Req } from "@nestjs/common";
import { Request as ExpressRequest } from "express";

interface CsrfRequest extends ExpressRequest {
  csrfToken: () => string;
}

@Controller("api")
export class SecurityController {
  @Get("csrf-token")
  async getCsrfToken(@Req() req: CsrfRequest) {
    return { csrfToken: req.csrfToken() };
  }
}
