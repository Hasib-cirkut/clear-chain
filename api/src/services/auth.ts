import { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import type { Context } from 'hono';
import { sign, verify } from 'hono/jwt';

import { ACCESS, DAY, MINUTE, REFRESH, SUPABASE } from '@/helpers/const.js';
import CustomLogger from '@/helpers/customLogger.js';
import type { THono } from '@/types/global.js';
import type { RegisterInput, LoginInput } from '@/types/user.js';

export const register = async (supabase: typeof SupabaseClient, input: RegisterInput) => {
  const { name, email, password } = input;

  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    CustomLogger('User already exists', `email: ${email}`);

    return { error: 'User already exists', status: 409, data: null };
  }

  if (findError) {
    CustomLogger(findError.message, `email: ${email}`);

    return { error: findError.message, status: 500, data: null };
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert([{ name, email, password_hash }]);

  if (error) {
    return { error: error.message, status: 500, data: null };
  }

  return { error: null, status: 201, data };
};

export const login = async (c: Context<THono>, input: LoginInput) => {
  const { email, password } = input;

  const supabase = c.get(SUPABASE);

  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();

  if (error) {
    CustomLogger(error.message, `email: ${email}`);

    return { error: error.message, status: 500, data: null };
  }

  const is_correct_password = await bcrypt.compare(password, data.password_hash);

  if (!is_correct_password) {
    return { error: 'Invalid credentials.', status: 401, data: null };
  }

  const accessToken = await sign(
    {
      email: data.email,
      sub: data.id,
      type: ACCESS,
      exp: MINUTE * 15,
    },
    c.env.JWT_SECRET
  );

  const refreshToken = await sign(
    {
      email: data.email,
      sub: data.id,
      type: REFRESH,
      exp: DAY * 7,
    },
    c.env.JWT_SECRET
  );

  const payload = { ...data, accessToken };
  delete payload.password_hash;

  return { error: null, status: 200, data: payload, refreshToken };
};

export const refreshToken = async (c: Context<THono>, refreshToken: string) => {
  try {
    const payload = await verify(refreshToken, c.env.JWT_SECRET);

    if (!payload || payload.type !== REFRESH) {
      return { error: 'Invalid Token', status: 401, data: null };
    }

    const supabase = c.get(SUPABASE);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .maybeSingle();

    if (error || !user) {
      return { error: 'Invalid Token', status: 401, data: null };
    }

    const newAccessToken = await sign(
      {
        email: user.email,
        sub: user.id,
        type: ACCESS,
        exp: Math.floor(Date.now() / 1000) + 60 * 15,
      },
      c.env.JWT_SECRET
    );

    return {
      error: null,
      status: 200,
      data: {
        accessToken: newAccessToken,
      },
    };
  } catch (e) {
    return { error: 'Invalid Token', status: 401, data: null };
  }
};
