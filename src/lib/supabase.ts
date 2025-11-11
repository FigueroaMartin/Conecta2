import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

// SOLO crear cliente cuando el código corre en el navegador
if (typeof window !== "undefined") {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("❌ Supabase env vars missing");
  } else {
    supabaseClient = createClient(url, key);
  }
}

export const supabase = supabaseClient;
