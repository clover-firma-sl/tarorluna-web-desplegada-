import { NextResponse } from "next/server";
import { getAdminUser, serverSupabaseConfig } from "@/lib/admin-auth";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function callAdminFunction(name: string, reservationKey: string) {
  const config = serverSupabaseConfig();
  if (!config) return { ok: false, status: 503, error: "La base de datos no está configurada." };
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_reservation_key: reservationKey }),
    cache: "no-store",
  });
  if (response.ok) return { ok: true, status: 200 };
  const detail = await response.text();
  const conflict = response.status === 409 || detail.includes("23505") || detail.includes("ocupada");
  return { ok: false, status: conflict ? 409 : 400, error: conflict ? "La franja ya está ocupada por otra cita." : "No se pudo completar la acción." };
}

async function authorize(request: Request, reservationKey: string) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Solicitud no válida." }, { status: 403 });
  if (!uuidPattern.test(reservationKey)) return NextResponse.json({ error: "Reserva no válida." }, { status: 400 });
  if (!(await getAdminUser())) return NextResponse.json({ error: "Sesión caducada." }, { status: 401 });
  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ reservationKey: string }> }) {
  const { reservationKey } = await params;
  const denied = await authorize(request, reservationKey);
  if (denied) return denied;
  const body = (await request.json()) as { action?: string };
  const functionName = body.action === "confirm_payment" ? "admin_confirm_reservation" : body.action === "cancel" ? "admin_cancel_reservation" : null;
  if (!functionName) return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  const result = await callAdminFunction(functionName, reservationKey);
  return result.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result.error }, { status: result.status });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ reservationKey: string }> }) {
  const { reservationKey } = await params;
  const denied = await authorize(request, reservationKey);
  if (denied) return denied;
  const result = await callAdminFunction("admin_delete_reservation", reservationKey);
  return result.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result.error }, { status: result.status });
}
