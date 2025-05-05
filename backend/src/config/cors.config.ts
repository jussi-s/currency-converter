import * as dotenv from "dotenv";
dotenv.config();

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];

export const corsOptions = {
  origin: (origin: string | undefined, callback: CorsOriginCallback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
};
