import { Hono } from 'hono';

import { getUsers } from '@/services/user.js';
import type { THono, TStatusCode } from '@/types/global.js';

const router = new Hono<THono>();

router.get('/', async c => {
  const { error, status, data } = await getUsers(c);

  if (error) {
    c.status(status as TStatusCode);

    return c.json({ error: error.message, data: null });
  }

  return c.json({ error: null, data: data });
});

export default router;
