import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map upload logs during build
  silent: true,

  // Upload source maps so Sentry shows real file names + line numbers
  widenClientFileUpload: true,

  // Delete source maps after upload (hides them from browser devtools)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
