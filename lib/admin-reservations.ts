import "server-only";

import { serverSupabaseConfig } from "@/lib/admin-auth";

export type AdminReservation = {
  id: number;
  reservation_key: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  duration: number;
  amount_cents: number;
  appointment_date: string;
  appointment_time: string;
  notes: string;
  status: string;
  payment_provider: string | null;
  payment_order: string | null;
  paid_at: string | null;
  created_at: string;
};

export async function getAdminReservations(status?: string): Promise<AdminReservation[]> {
  const config = serverSupabaseConfig();
  if (!config) throw new Error("Supabase no está configurado.");

  const fields = [
    "id", "reservation_key", "name", "email", "phone", "category", "duration",
    "amount_cents", "appointment_date", "appointment_time", "notes", "status",
    "payment_provider", "payment_order", "paid_at", "created_at",
  ].join(",");
  const allowed = new Set(["pending_payment", "paid", "payment_failed", "cancelled", "refunded", "completed", "no_show"]);
  const filter = status && allowed.has(status) ? `&status=eq.${encodeURIComponent(status)}` : "";
  const response = await fetch(
    `${config.url}/rest/v1/reservations?select=${fields}${filter}&order=appointment_date.desc,appointment_time.desc&limit=250`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("No se pudieron cargar las reservas.");
  return response.json() as Promise<AdminReservation[]>;
}
