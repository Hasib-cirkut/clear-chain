import { Hono } from 'hono';

const healthCheck = new Hono();

healthCheck.get('/', c => {
  return c.json({ message: 'healthy' });
});

export default healthCheck;
