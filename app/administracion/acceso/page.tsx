import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminUser } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Acceso privado",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLoginPage() {
  if (await getAdminUser()) redirect("/administracion");
  return <main className="admin-login-page"><AdminLoginForm /></main>;
}
