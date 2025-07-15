import type { Context } from 'hono';

import { SUPABASE } from '@/helpers/const.js';
import type { THono } from '@/types/global.js';
import type { TUser } from '@/types/user.js';

export async function getUsers(c: Context<THono>) {
  const supabase = c.get(SUPABASE);

  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    return { error: error, status: 500, data: null };
  }

  const cleanData = users.map((user: TUser) => {
    delete user.password_hash;

    return {
      ...user,
    };
  });

  return { error: null, status: 200, data: cleanData };
}
