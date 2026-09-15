import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.accessToken",
      "*.idToken",
      "*.code_verifier",
      "headers.authorization",
      "headers.cookie",
    ],
    censor: "[redacted]",
  },
  transport: isProd ? undefined : { target: "pino-pretty", options: { colorize: true } },
});
