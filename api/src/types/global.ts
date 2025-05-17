import type {createClient} from "@supabase/supabase-js";

type Env = {
    SUPABASE_URL: string,
    SUPABASE_KEY: string,
    JWT_SECRET: string,
    ENVIRONMENT: "production" | "development",
}

type Variables = {
    supabase: ReturnType<typeof createClient>
}

export type TStatusCode = 200 | 400 | 401 | 403 | 404 | 409 | 500;

export type THono = {
    Bindings: Env,
    Variables: Variables
}