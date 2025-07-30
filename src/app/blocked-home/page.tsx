"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  ShieldX,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  LogOut,
} from 'lucide-react';

interface UnblockRequest {
  message: string;
}

const BlockedUserHome: React.FC = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState<UnblockRequest>({
    message: '',
  });
  const [errors, setErrors] = useState<Partial<UnblockRequest>>({});
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch userId on mount (from localStorage or JWT if available)
  useEffect(() => {
    // Try to get userId from localStorage (if stored)
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user._id || user.userId || null);
      } catch {}
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<UnblockRequest> = {};
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (value: string): void => {
    setFormData((prev) => ({ ...prev, message: value }));
    if (errors.message) {
      setErrors((prev) => ({ ...prev, message: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (!userId) throw new Error('User ID not found');
      const res = await fetch('/api/admin/unblock-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: formData.message }),
      });
      if (!res.ok) throw new Error('Failed to submit request');
      setIsSuccess(true);
      setFormData({ message: '' });
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit unblock request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      // Call logout API
      await fetch('/api/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear client-side data and redirect
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const resetModal = (): void => {
    setFormData({ message: '' });
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-destructive/20 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive mb-2">
              Account Blocked
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Admin blocked your account for improper behavior.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your access to BloodBridge has been temporarily suspended. 
                You can request to have your account reviewed by our admin team.
              </AlertDescription>
            </Alert>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                  onClick={resetModal}
                  disabled={isLoggingOut}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Unblock Request
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                {isSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <DialogTitle className="text-xl font-semibold text-green-700 mb-2">
                      Request Sent Successfully!
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Your unblock request has been submitted to the admin team. 
                      You will receive a confirmation email shortly.
                    </DialogDescription>
                  </div>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-red-600" />
                        Request Account Unblock
                      </DialogTitle>
                      <DialogDescription>
                        Please explain why your account should be unblocked.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Please explain why you believe your account should be unblocked..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => handleInputChange(e.target.value)}
                          className={errors.message ? 'border-destructive' : ''}
                          disabled={isSubmitting}
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive">{errors.message}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-red-600 cursor-pointer hover:bg-red-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Request
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-50"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Need immediate assistance?</p>
          <p className="mt-1">
            Contact support at{' '}
            <a
              href="mailto:support@bloodbridge.com"
              className="text-red-600 hover:text-red-700 underline"
            >
              support@bloodbridge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockedUserHome;
