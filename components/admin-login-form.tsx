"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No se pudo iniciar sesión.");
        return;
      }
      window.location.assign("/administracion");
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <div className="admin-lock"><LockKeyhole aria-hidden="true" /></div>
      <p className="eyebrow">Acceso privado</p>
      <h1>Administración</h1>
      <p>Acceso exclusivo para la empresa. La sesión caduca automáticamente.</p>
      <label>
        Correo empresarial
        <input name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label>
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required minLength={12} maxLength={256} />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button admin-login-button" type="submit" disabled={loading}>
        {loading ? "Comprobando…" : "Entrar de forma segura"}
      </button>
      <small>Nunca compartas la contraseña ni códigos de verificación.</small>
    </form>
  );
}
