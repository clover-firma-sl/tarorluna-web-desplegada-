"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReservationActions({ reservationKey, status }: { reservationKey: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(action: "confirm_payment" | "cancel" | "delete") {
    const questions = {
      confirm_payment: "¿Confirmas que el pago se ha recibido? La hora quedará bloqueada definitivamente.",
      cancel: "¿Cancelar esta cita y liberar su horario?",
      delete: "¿Eliminar definitivamente esta solicitud y sus datos personales? Esta acción no se puede deshacer.",
    };
    if (!window.confirm(questions[action])) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/reservas/${reservationKey}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No se pudo completar la acción.");
        if (response.status === 401) window.location.assign("/administracion/acceso");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  const removable = ["pending_payment", "payment_failed", "cancelled"].includes(status);
  return <div className="admin-actions">
    {(status === "pending_payment" || status === "payment_failed") && <button type="button" className="admin-action-confirm" disabled={loading} onClick={() => run("confirm_payment")}>Confirmar pago</button>}
    {(status === "paid" || status === "pending_payment" || status === "payment_failed") && <button type="button" disabled={loading} onClick={() => run("cancel")}>Cancelar cita</button>}
    {removable && <button type="button" className="admin-action-delete" disabled={loading} onClick={() => run("delete")}>Eliminar</button>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
