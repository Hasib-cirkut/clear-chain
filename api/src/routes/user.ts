import { Hono } from 'hono';

const router = new Hono();

router.get('/', async c => {
  const users = [{ name: 'Jhon' }, { name: 'Jane' }];

  return c.json({ users });
});

export default router;
