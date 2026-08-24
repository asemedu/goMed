import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://cgjleokkaujrpmshubqf.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnamxlb2trYXVqcnBtc2h1YnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjIxNDUsImV4cCI6MjA5OTkzODE0NX0.HPnAmFs79-M73hurgg8YJQ09Qy8UlgRh8P_FuLWhn8U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
