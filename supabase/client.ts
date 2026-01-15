
import { createClient } from '@supabase/supabase-js';

// Configuração do novo projeto Supabase.
const supabaseUrl = 'https://ressclwspxatkfjgtwyg.supabase.co';
const supabaseAnonKey = 'sb_publishable_RkIMKzWCI01utT912qcRVA_wrDNdaIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);