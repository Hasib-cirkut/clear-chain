import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { jwt } from 'hono/jwt';
import { logger } from 'hono/logger';

import CustomLogger from '@/helpers/customLogger.js';
import { createSupabaseClient } from '@/helpers/supabaseClient.js';
import authRouter from '@/routes/auth.js';
import healthCheckRouter from '@/routes/healthCheck.js';
import userRouter from '@/routes/user.js';
import type { THono } from '@/types/global.js';

const app = new Hono<THono>();

app.use('*', async (c, next) => {
  const { SUPABASE_URL, SUPABASE_KEY } = env<{ SUPABASE_URL: string; SUPABASE_KEY: string }>(c);

  const supabaseClient = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  c.set('supabase', supabaseClient);

  await next();
});

app.use('/api/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });

  return jwtMiddleware(c, next);
});

app.use(logger(CustomLogger));
app.route('/auth', authRouter);
app.route('/health-check', healthCheckRouter);
app.route('/api/user', userRouter);

// Export the fetch handler for Cloudflare Workers
export default {
  fetch: app.fetch,
};
