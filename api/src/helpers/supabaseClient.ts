import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (url: string, key: string) => {
  return createClient(url, key);
};
