import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://example.supabase.co";
const fallbackAnonKey = "placeholder-anon-key";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? fallbackAnonKey
);
