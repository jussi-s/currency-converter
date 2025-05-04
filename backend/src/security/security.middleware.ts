import helmet from "helmet";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import { INestApplication } from "@nestjs/common";

export function applySecurityMiddleware(app: INestApplication) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

  // CSRF Protection
  app.use(cookieParser());
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );
}
