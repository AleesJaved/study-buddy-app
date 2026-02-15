import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://vgefjfftcckmpscvcxhy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FRP_X6OSOO4wtI5COQ2Crg_Lf4nPBjK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
