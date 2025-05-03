import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import request from "supertest";
import csurf from "csurf";
import cookieParser from "cookie-parser";

let app: INestApplication;
let csrfToken: string;
let csrfCookie: string;
let agent: ReturnType<typeof request.agent>;

jest.setTimeout(30000);

describe("ExchangeRateController (e2e)", () => {
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider("REDIS_CLIENT")
      .useValue({
        get: jest.fn().mockResolvedValue(
          JSON.stringify([
            {
              base_currency: "USD",
              quote_currency: "EUR",
              quote: 1.1,
              date: "2025-05-03",
            },
          ])
        ),
        set: jest.fn(),
        ttl: jest.fn().mockResolvedValue(100),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
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
    await app.init();

    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api/csrf-token (GET)", async () => {
    const res = await agent.get("/api/csrf-token");
    expect(res.status).toBe(200);
    csrfToken = res.body.csrfToken;

    const cookieHeader = res.headers["set-cookie"];
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
    csrfCookie = cookies.find((c) => c?.startsWith("_csrf=")) ?? "";
    expect(csrfToken).toBeDefined();
    expect(csrfCookie).toBeTruthy();
  });

  it("/api/currencies (GET)", async () => {
    const res = await agent.get("/api/currencies");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("/api/target-currencies (GET) - success", async () => {
    const res = await agent.get("/api/target-currencies?baseCurrency=USD");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("/api/target-currencies (GET) - missing param", async () => {
    const res = await agent.get("/api/target-currencies");
    expect(res.status).toBe(400);
  });

  it("/api/exchange-rates (GET)", async () => {
    const res = await agent.get("/api/exchange-rates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("/api/health (GET)", async () => {
    const res = await agent.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("lastUpdated");
  });

  describe("/api/force-update-cache (POST)", () => {
    beforeEach(async () => {
      const res = await agent.get("/api/csrf-token");
      csrfToken = res.body.csrfToken;

      const cookieHeader = res.headers["set-cookie"];
      const cookies = Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader];
      csrfCookie = cookies.find((c) => c?.startsWith("_csrf=")) ?? "";
    });

    it("fails without CSRF", async () => {
      const res = await agent.post("/api/force-update-cache").send();
      expect(res.status).toBe(403);
    });

    it("succeeds with CSRF", async () => {
      const res = await agent
        .post("/api/force-update-cache")
        .set("XSRF-TOKEN", csrfToken)
        .set("Cookie", csrfCookie)
        .send();
      expect(res.status).toBe(201);
    });
  });
});
