import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase Project credentials 
// Ideally stored securely in a root level .env file later
const supabaseUrl = 'https://cgjleokkaujrpmshubqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnamxlb2trYXVqcnBtc2h1YnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjIxNDUsImV4cCI6MjA5OTkzODE0NX0.HPnAmFs79-M73hurgg8YJQ09Qy8UlgRh8P_FuLWhn8U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);