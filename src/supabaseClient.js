import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// createClient throws synchronously on a missing URL/key, which would crash
// the whole module graph before React even mounts (a blank page with no clue
// why). Skip creating a real client when unconfigured; App.jsx checks
// isSupabaseConfigured and shows a setup screen instead of touching this.
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
