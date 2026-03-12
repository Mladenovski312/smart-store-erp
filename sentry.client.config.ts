import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Send 100% of errors (fine for low-traffic sites, reduce if volume grows)
  sampleRate: 1.0,

  // Performance monitoring: sample 20% of page loads for speed tracking
  tracesSampleRate: 0.2,

  // Don't send errors in local development
  enabled: process.env.NODE_ENV === "production",
});
