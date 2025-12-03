export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  role?: string;
}
