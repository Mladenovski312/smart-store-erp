"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="mk">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Настана грешка</h1>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>Се извинуваме за непријатноста. Обидете се повторно.</p>
            <button
              onClick={reset}
              style={{ background: "#1e3a5f", color: "white", border: "none", padding: "0.75rem 2rem", borderRadius: "0.75rem", fontWeight: "bold", cursor: "pointer" }}
            >
              Обиди се повторно
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
