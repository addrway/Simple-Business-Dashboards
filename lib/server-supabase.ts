import { createClient } from "@supabase/supabase-js";

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export function createSupabaseRouteClient(accessToken?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false }
  });
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function requireUser(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: "Missing Authorization bearer token", status: 401 as const };
  }

  const supabase = createSupabaseRouteClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { error: "Invalid or expired session", status: 401 as const };
  }

  return { supabase, user: data.user, token };
}
