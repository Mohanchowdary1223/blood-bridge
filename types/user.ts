export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

export interface UserSignUp {
  email: string;
  password: string;
  name: string;
}

export interface UserSignIn {
  email: string;
  password: string;
}
