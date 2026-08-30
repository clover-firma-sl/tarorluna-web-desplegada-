import "server-only";

import { cookies } from "next/headers";

const ADMIN_COOKIE = "tarot_luna_admin";
const ADMIN_EMAIL = "lunatarotista211@gmail.com";

type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return { url, key };
}

export function configuredAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? ADMIN_EMAIL).trim().toLowerCase();
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}

export async function getAdminUser(): Promise<AuthUser | null> {
  const config = supabaseConfig();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!config || !token) return null;

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const user = (await response.json()) as AuthUser;
  if (!user.email_confirmed_at) return null;
  if (user.email?.toLowerCase() !== configuredAdminEmail()) return null;
  return user;
}

export async function signInAdmin(email: string, password: string) {
  const config = supabaseConfig();
  if (!config) return { ok: false as const };
  if (email.trim().toLowerCase() !== configuredAdminEmail()) return { ok: false as const };

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: config.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    cache: "no-store",
  });

  if (!response.ok) return { ok: false as const };
  const session = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    user?: AuthUser;
  };

  if (!session.access_token || !session.user?.email_confirmed_at) return { ok: false as const };
  if (session.user.email?.toLowerCase() !== configuredAdminEmail()) return { ok: false as const };

  return {
    ok: true as const,
    accessToken: session.access_token,
    maxAge: Math.min(Math.max(session.expires_in ?? 3600, 300), 3600),
  };
}

export function serverSupabaseConfig() {
  return supabaseConfig();
}
