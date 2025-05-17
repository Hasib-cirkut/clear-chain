import { Hono } from 'hono';
import { setCookie, getCookie } from 'hono/cookie';

import { PRODUCTION } from '@/helpers/const.js';
import { register, login, refreshToken } from '@/services/auth.js';
import type { THono, TStatusCode } from '@/types/global.js';

const auth = new Hono<THono>();

auth.post('/register', async c => {
  const body = await c.req.json();

  const { name, email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Missing email or password' }, 400);
  }

  const result = await register(c.get('supabase'), { name, email, password });

  if (result.error) {
    c.status(result.status as TStatusCode);

    return c.json({ error: result.error });
  }

  return c.json({ message: 'User created successfully', data: result.data }, 201);
});

auth.post('/login', async c => {
  const isProd = c.env.ENVIRONMENT === PRODUCTION;
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Missing email or password' }, 400);
  }

  const result = await login(c, { email, password });

  if (result.error) {
    return c.json({ error: result.error }, result.status as TStatusCode);
  }

  setCookie(c, 'refreshToken', result.refreshToken as string, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json({ message: 'Login Successful', data: result.data }, 200);
});

auth.post('/refresh', async c => {
  const isProd = c.env.ENVIRONMENT === PRODUCTION;
  const rToken = getCookie(c, 'refreshToken');

  if (!rToken) {
    return c.json({ error: 'No refresh token found' }, 401);
  }

  const result = await refreshToken(c, rToken);

  if (result.error) {
    setCookie(c, 'refreshToken', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return c.json({ error: result.error }, result.status as TStatusCode);
  }

  return c.json({ data: result.data }, 200);
});

auth.post('/logout', async c => {
  const isProd = c.env.ENVIRONMENT === PRODUCTION;
  setCookie(c, 'refreshToken', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return c.json({ message: 'Logged out successfully' }, 200);
});

export default auth;
