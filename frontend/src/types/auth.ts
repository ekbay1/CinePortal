export type User = {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type SignupInput = {
  email: string;
  password: string;
  full_name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};