'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, Shield, Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt?: string; // Optional if you have this data
}

export default function AdminProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
            <p className="text-sm text-muted-foreground">Unable to load admin profile information.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Back Button - Fixed Position */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/admin')}
        className="fixed top-16 left-2 md:top-24 md:left-6 h-10 w-10 sm:h-12 sm:w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
      </Button>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your administrative account information</p>
      </div>

      {/* Main Profile Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                {user.name}
              </CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <User className="w-4 h-4 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-foreground font-medium">{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <Shield className="w-4 h-4 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <p className="text-foreground font-medium">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <Mail className="w-4 h-4 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                      <p className="text-foreground font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <Phone className="w-4 h-4 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="text-foreground font-medium">{user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <Separator className="my-8" />
          
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-foreground font-bold">{user.id}</p>
              </div>
              
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Access Level</p>
                <p className="text-foreground font-bold">Administrator</p>
              </div>
              
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
