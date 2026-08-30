"use client";

import { useState } from "react";

export function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/administracion/acceso");
  }

  return <button className="secondary-button" type="button" onClick={logout} disabled={loading}>{loading ? "Cerrando…" : "Cerrar sesión"}</button>;
}
