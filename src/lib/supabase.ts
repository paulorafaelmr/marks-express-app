import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://jknvjffiogzjclmcjlua.supabase.co";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_Hqfz9u--CMfzPxSU4nQdFg_5lY-za8R";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
