import { Hono } from 'hono'
import {createSupabaseClient} from "rootDir/supabaseClient.js"
import { logger } from "hono/logger"
import CustomLogger from "@/helpers/customLogger.js"
import auth from '@/routes/auth.js'
import healthCheck from '@/routes/healthCheck.js'

import {env} from "hono/adapter"
import {createClient} from "@supabase/supabase-js";

type Env = {
  SUPABASE_URL: string,
  SUPABASE_KEY: string,
}

type Variables = {
  supabase: ReturnType<typeof createClient>
}

const app = new Hono<{Bindings: Env; Variables: Variables}>()

app.use('*', async (c, next) => {
  const {SUPABASE_URL, SUPABASE_KEY} = env<{ SUPABASE_URL: string, SUPABASE_KEY: string }>(c)

  c.set('supabase', createSupabaseClient(SUPABASE_URL, SUPABASE_KEY))

  await next()
})

app.use(logger(CustomLogger))
app.route('/auth', auth)
app.route('/health-check', healthCheck)

// Export the fetch handler for Cloudflare Workers
export default {
  fetch: app.fetch
}