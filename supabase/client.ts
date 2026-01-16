
import { createClient } from '@supabase/supabase-js';

// Configuração do novo projeto Supabase.
const supabaseUrl = 'https://plscheubmnqjlhjyztlv.supabase.co';
const supabaseAnonKey = 'sb_publishable_gdsbT7Nzpt8RfMv0HykFEg_WIK34aZX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);