export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const MONGODB_URI = process.env.MONGODB_URI;
export const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY || 'your-secure-admin-key';

// JWT Configuration
export const JWT_CONFIG = {
  expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
};

// Cookie Configuration
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}; 