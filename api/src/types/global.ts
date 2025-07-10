import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database.types.js';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  JWT_SECRET: string;
  ENVIRONMENT: 'production' | 'development';
};

type Variables = {
  supabase: SupabaseClient<Database>;
};

export type TStatusCode = 200 | 400 | 401 | 403 | 404 | 409 | 500;

export type THono = {
  Bindings: Env;
  Variables: Variables;
};
