import {Hono} from "hono";

import {register, login} from "@/services/auth.js";
import type {createClient} from "@supabase/supabase-js";

type Env = {
    SUPABASE_URL: string,
    SUPABASE_KEY: string,
}

type Variables = {
    supabase: ReturnType<typeof createClient>
}

const auth = new Hono<{Bindings: Env; Variables: Variables}>()

auth.post("/register", async (c) => {
    const body = await c.req.json()

    const {name, email, password} = body

    if(!email || !password) {
        return c.json({error: 'Missing email or password'}, 400)
    }

    const result = await register(c.get('supabase'), {name, email, password})

    if(result.error) {
        return c.json({error: result.error}, result.status)
    }

    return c.json({message: 'User created successfully', data: result.data}, 201)
})


auth.post("/login", async (c) => {
    const body = await c.req.json()

    const {email, password} = body

    if(!email || !password) {
        return c.json({error: 'Missing email or password'}, 400)
    }

    const result = await login(c.get('supabase'), {email, password})

    if(result.error) {
        return c.json({error: result.error}, result.status)
    }

    return c.json({message: 'Login Successful', data: result.data}, 200)
})

export default auth
