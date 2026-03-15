import type { Metadata } from "next";
import { AdminSW } from "./AdminSW";

export const metadata: Metadata = {
  title: "Админ Панел | Интер Стар Џамбо",
  manifest: "/admin-manifest.json",
  other: {
    "theme-color": "#0028a3",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminSW />
    </>
  );
}
