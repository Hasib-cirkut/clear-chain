export type TUser = {
  id: string;
  name: string | null;
  email: string;
  password_hash?: string;
  created_at: string;
  updated_at: string;
};

export type RegisterInput = {
  name?: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
