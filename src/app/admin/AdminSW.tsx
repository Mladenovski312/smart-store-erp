"use client";

import { useEffect } from "react";

export function AdminSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/" });
    }
  }, []);
  return null;
}
