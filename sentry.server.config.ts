import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sampleRate: 1.0,
  tracesSampleRate: 0.2,

  enabled: process.env.NODE_ENV === "production",
});
