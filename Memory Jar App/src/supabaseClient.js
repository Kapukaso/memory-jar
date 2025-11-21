import { createClient } from '@supabase/supabase-js';

// Project URL derived from dashboard URL: https://supabase.com/dashboard/project/zthvwpwzrpgpqjtzklfy
const supabaseUrl = 'https://zthvwpwzrpgpqjtzklfy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aHZ3cHd6cnBncHFqdHprbGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjU4MTMsImV4cCI6MjA3OTMwMTgxM30.btHwRPCA4Ry8-1_COruF-iRdptGPCSSYxabVLRRX-Xg';

export const supabase = createClient(supabaseUrl, supabaseKey);
