import { hasMinimumNotice, occupiedKeys, slotsForDate } from "@/lib/schedule";

type Payload = { name?: string; email?: string; phone?: string; category?: string; duration?: string; date?: string; time?: string; notes?: string; consent?: string };
const allowedCategories = new Set(["amor", "trabajo", "economia", "familia", "general"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const duration = Number(url.searchParams.get("duration"));
  if (!datePattern.test(date) || ![10, 30, 60].includes(duration)) return Response.json({ error: "Fecha o duración no válidas." }, { status: 400 });
  const candidates = slotsForDate(date, duration), config = supabaseConfig();
  if (!config) return Response.json({ slots: candidates, databaseConfigured: false });
  const response = await fetch(`${config.url}/rest/v1/booked_slots?select=slot_key&slot_key=like.${encodeURIComponent(`${date}|%`)}`, { headers: headers(config.key), cache: "no-store" });
  if (!response.ok) return Response.json({ error: "No se pudo consultar la agenda." }, { status: 502 });
  const result = await response.json() as Array<{ slot_key: string }>;
  const occupied = new Set(result.map((row) => row.slot_key));
  const slots = candidates.filter((time) => hasMinimumNotice(date, time) && occupiedKeys(date, time, duration).every((key) => !occupied.has(key)));
  return Response.json({ slots });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Payload;
    const name = body.name?.trim() ?? "", email = body.email?.trim().toLowerCase() ?? "", phone = body.phone?.trim() ?? "", category = body.category ?? "", date = body.date ?? "", time = body.time ?? "", notes = body.notes?.trim() ?? "", duration = Number(body.duration);
    const validSlot = datePattern.test(date) && slotsForDate(date, duration).includes(time) && hasMinimumNotice(date, time);
    if (!name || !email.includes("@") || !phone || !allowedCategories.has(category) || !validSlot || body.consent !== "accepted") return Response.json({ error: "Revisa los datos y recuerda reservar con un mínimo de 24 horas de antelación." }, { status: 400 });
    const config = supabaseConfig();
    if (!config) return Response.json({ error: "La agenda todavía no tiene conectada su base de datos. Puedes reservar mediante Google Forms." }, { status: 503 });
    const reservationKey = crypto.randomUUID();
    const response = await fetch(`${config.url}/rest/v1/rpc/create_reservation`, { method: "POST", headers: headers(config.key), body: JSON.stringify({ p_reservation_key: reservationKey, p_name: name, p_email: email, p_phone: phone, p_category: category, p_duration: duration, p_date: date, p_time: time, p_notes: notes.slice(0, 800), p_slot_keys: occupiedKeys(date, time, duration) }) });
    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 409 || detail.includes("duplicate key")) return Response.json({ error: "Esa franja acaba de ocuparse. Elige otra hora." }, { status: 409 });
      throw new Error(detail);
    }

    if (process.env.RESEND_API_KEY) await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESERVATION_FROM_EMAIL ?? "Reservas Tarot Luna <reservas@resend.dev>", to: ["lunatarotista211@gmail.com"], subject: `Nueva reserva de ${name}`, text: `Consulta: ${category}\nDuración: ${duration} minutos\nFecha: ${date} ${time}\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\n${notes}` }) });
    return Response.json({ ok: true, reservationKey }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    if (message.includes("UNIQUE") || message.includes("booked_slots") || message.includes("reservation_slot_unique")) return Response.json({ error: "Esa franja acaba de ocuparse. Elige otra hora." }, { status: 409 });
    return Response.json({ error: "No se pudo registrar la reserva. Inténtalo de nuevo." }, { status: 500 });
  }
}
