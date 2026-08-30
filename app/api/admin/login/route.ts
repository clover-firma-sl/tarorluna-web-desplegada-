import { NextResponse } from "next/server";
import { adminCookieName, signInAdmin } from "@/lib/admin-auth";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Solicitud no válida." }, { status: 403 });

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.slice(0, 254) ?? "";
    const password = body.password?.slice(0, 256) ?? "";
    if (!email || !password) return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });

    const result = await signInAdmin(email, password);
    if (!result.ok) return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName(), result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: result.maxAge,
      priority: "high",
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar sesión." }, { status: 400 });
  }
}
