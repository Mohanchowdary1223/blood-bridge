
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
  bloodType?: string;
}


export interface UserSignUp {
  email: string;
  password: string;
  name: string;
  bloodType?: string;
}

export interface UserSignIn {
  email: string;
  password: string;
}
