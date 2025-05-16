import { Hono } from 'hono'
import {env} from "hono/adapter"
import { jwt } from 'hono/jwt'
import { logger } from "hono/logger"

import CustomLogger from "@/helpers/customLogger.js"
import auth from '@/routes/auth.js'
import healthCheck from '@/routes/healthCheck.js'
import user from '@/routes/user.js'
import type {THono} from "@/types/global.js";
import {createSupabaseClient} from "rootDir/supabaseClient.js"


const app = new Hono<THono>()

app.use('*', async (c, next) => {
  const {SUPABASE_URL, SUPABASE_KEY} = env<{ SUPABASE_URL: string, SUPABASE_KEY: string }>(c)

  c.set('supabase', createSupabaseClient(SUPABASE_URL, SUPABASE_KEY))

  await next()
})

app.use('/api/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET
  })

  return jwtMiddleware(c, next)
})

app.use(logger(CustomLogger))
app.route('/auth', auth)
app.route('/health-check', healthCheck)
app.route('/api/user', user)

// Export the fetch handler for Cloudflare Workers
export default {
  fetch: app.fetch
}