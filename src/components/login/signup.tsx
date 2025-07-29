"use client"
import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Droplets, CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from "@/components/ui/calendar"

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  signupReason: string;
  dateOfBirth?: string;
  currentAge?: string;
  bloodType: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  signupReason?: string;
  dateOfBirth?: string;
  bloodType?: string;
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-CA") // YYYY-MM-DD format for input[type="date"]
}

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    signupReason: '',
    dateOfBirth: '',
    bloodType: '',
  });
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and max 10 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate age when date of birth changes
    if (name === 'dateOfBirth' && value) {
      const dobDate = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dobDate.getFullYear();
      const monthDiff = now.getMonth() - dobDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      const calculatedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate()) 
        ? age - 1 
        : age;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        currentAge: calculatedAge.toString()
      }));
      setSelectedDate(new Date(value));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    const dateString = formatDate(date);
    
    if (date) {
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      const monthDiff = now.getMonth() - date.getMonth();
      
      const calculatedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate()) 
        ? age - 1 
        : age;
      
      setFormData({
        ...formData,
        dateOfBirth: dateString,
        currentAge: calculatedAge.toString()
      });
    } else {
      setFormData({
        ...formData,
        dateOfBirth: '',
        currentAge: ''
      });
    }
    setShowCalendar(false);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!formData.signupReason) {
      newErrors.signupReason = 'Please select a reason for signing up';
    }
    if (!formData.bloodType) {
      newErrors.bloodType = 'Please select your blood group';
    } else if (formData.bloodType === "I don't know my blood type" || formData.bloodType === 'unknown') {
      // Allow 'Don't know' as a valid option
      delete newErrors.bloodType;
    }
    if (formData.signupReason === 'underAge' && !formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required for under age';
    }
    if (formData.signupReason === 'aboveAge' && !formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required for above age';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.fullName,
              phone: formData.phone,
              signupReason: formData.signupReason,
              dateOfBirth: formData.dateOfBirth,
              currentAge: formData.currentAge,
              bloodType: formData.bloodType
            })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/home');
        }, 500);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Signup failed. Please try again.');
        } else {
          setError('Signup failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const signupReasons = [
    { value: 'donateLater', label: 'I will register and donate blood later' },
    { value: 'healthIssue', label: 'Health issue or some bad habit' },
    { value: 'underAge', label: 'Under age (below 18)' },
    { value: 'aboveAge', label: 'Above age (over 65)' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Back Button - Fixed Position */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
        className="fixed top-16 md:top-24 left-2 md:left-2 h-10 md:h-10 w-10 md:w-10 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
        aria-label="Back to Home"        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </Button>

        {/* Main Card */}
        <Card className="border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center ">
                <Droplets className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Join our BloodBridge community
              </CardDescription>
            </div>

            {/* Navigation Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="p-0 h-auto text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Sign in
                </Button>
              </p>
              <p className="text-sm text-muted-foreground">
                Want to donate blood?{' '}
                <Button
                  variant="link"
                  onClick={() => router.push('/register')}
                  className="p-0 h-auto text-green-600 hover:text-green-700 font-semibold cursor-pointer"
                >
                  Register as Donor
                </Button>
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className={`pl-10 h-12 ${errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.fullName}
                  </p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 h-12 ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.password}
                    </p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        className={`pl-10 h-12 ${errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.confirmPassword}
                    </p>}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone number"
                      className={`pl-10 h-12 ${errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.phone}
                  </p>}
                </div>
              </div>


              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700">Blood Group</Label>
                <select
                  id="bloodType"
                  name="bloodType"
                  className={`h-12 w-full border rounded-md px-3 ${errors.bloodType ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                  value={formData.bloodType}
                  onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                  required
                >
                  <option value="">Select your blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="unknown">I don't know my blood type</option>
                </select>
                {errors.bloodType && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.bloodType}
                </p>}
              </div>

              {/* Signup Reason */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Reason for Sign Up</Label>
                <RadioGroup 
                  value={formData.signupReason} 
                  onValueChange={(value) => setFormData({...formData, signupReason: value})}
                  className="space-y-3"
                >
                  {signupReasons.map((reason) => (
                    <div key={reason.value} className="flex items-start space-x-3 bg-gray-50/50 rounded-lg p-4 hover:bg-gray-100/50 transition-colors border border-gray-200">
                      <RadioGroupItem value={reason.value} id={reason.value} className="cursor-pointer mt-0.5" />
                      <Label htmlFor={reason.value} className="cursor-pointer text-sm text-gray-700 flex-1 leading-relaxed">
                        {reason.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.signupReason && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.signupReason}
                </p>}
              </div>

              {/* Date of Birth (Conditional) */}
              {(formData.signupReason === 'underAge' || formData.signupReason === 'aboveAge') && (
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={`w-full justify-start text-left font-normal h-12 pl-10 pr-3 cursor-pointer ${
                        !formData.dateOfBirth && "text-muted-foreground"
                      } ${errors.dateOfBirth ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-red-300 focus:border-red-500'}`}
                    >
                      {formData.dateOfBirth ? (
                        new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      ) : (
                        "Select date of birth"
                      )}
                    </Button>
                    
                    {showCalendar && (
                      <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg border border-gray-200 p-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          className="rounded-md bg-white border-0"
                          captionLayout="dropdown"
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                  {errors.dateOfBirth && <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.dateOfBirth}
                  </p>}
                  {formData.dateOfBirth && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <span className="font-medium">Current Age: </span>
                      <span className="text-blue-700 font-semibold">{formData.currentAge || ''} years</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Alerts */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    Please fill out all required fields correctly.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <Card className="p-6 border-0 bg-white max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Created!</h3>
              <p className="text-sm text-muted-foreground">Welcome to BloodBridge community!</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Signup;
