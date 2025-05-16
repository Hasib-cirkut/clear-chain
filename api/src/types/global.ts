import type {createClient} from "@supabase/supabase-js";

type Env = {
    SUPABASE_URL: string,
    SUPABASE_KEY: string,
    JWT_SECRET: string,
}

type Variables = {
    supabase: ReturnType<typeof createClient>
}

export type THono = {
    Bindings: Env,
    Variables: Variables
}