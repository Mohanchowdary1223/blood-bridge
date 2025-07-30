"use client"
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowLeft, Droplets } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user info
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      setShowSuccess(true);
      
      // Redirect based on user role
      setTimeout(() => {
        setShowSuccess(false);
        if (data.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials or sign up.');
      } else {
        setError('Login failed. Please check your credentials or sign up.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Back Button - Fixed Position */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="fixed top-16 md:top-24 left-2 md:left-2 h-10 md:h-10 w-10 md:w-10 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
          </Button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-6">
              {/* Logo */}
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Droplets className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Sign in to continue saving lives
                </CardDescription>
              </motion.div>

              {/* Navigation Links */}
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => router.push('/signup')}
                    className="p-0 h-auto cursor-pointer text-red-600 hover:text-red-700 font-semibold"
                  >
                    Sign up
                  </Button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Want to donate blood?{' '}
                  <Button
                    variant="link"
                    onClick={() => router.push('/register')}
                    className="p-0 h-auto cursor-pointer text-green-600 hover:text-green-700 font-semibold"
                  >
                    Register as Donor
                  </Button>
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </motion.div>

                {/* Remember Me */}
                <motion.div 
                  className="flex items-center space-x-2 cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </motion.div>

                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full cursor-pointer h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <p className="text-xs text-muted-foreground">
            Trusted by 10,000+ blood donors worldwide
          </p>
        </motion.div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 border-0 bg-white max-w-sm w-full mx-4">
                <div className="text-center">
                  <motion.div 
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Successful!</h3>
                  <p className="text-sm text-muted-foreground">Redirecting you to your dashboard...</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Login;
