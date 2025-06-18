import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://swzypvvwwiqzciwemvxw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3enlwdnZ3d2lxemNpd2Vtdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzUxMjMsImV4cCI6MjA2NTc1MTEyM30.9m4ho2HVcYEgcaLvO12W4LnOGgQ7ACrDPmjFa00vRdM';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };