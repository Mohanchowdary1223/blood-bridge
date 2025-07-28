'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Heart, LogOut, User, Shield, Mail, UserX, LayoutDashboard } from 'lucide-react';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      router.push('/login');
    }
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
            >
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            </Button>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation - Dashboard, Users, Donors, Blocked Users, and Mails */}
            <div className="hidden md:flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/users')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/donors')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Heart className="w-4 h-4 mr-2" />
                Donors
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/blockedusers')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <UserX className="w-4 h-4 mr-2" />
                Blocked Users
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/mails')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2" />
                Mails
              </Button>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full cursor-pointer"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    System Administrator
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => router.push('/admin/profile')}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                {/* Mobile only - Dashboard, Users, Donors, Blocked Users, and Mails in dropdown */}
                <DropdownMenuItem
                  onClick={() => router.push('/admin')}
                  className="cursor-pointer md:hidden"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/admin/users')}
                  className="cursor-pointer md:hidden"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/admin/donors')}
                  className="cursor-pointer md:hidden"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Donors
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/admin/blockedusers')}
                  className="cursor-pointer md:hidden"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Blocked Users
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/admin/mails')}
                  className="cursor-pointer md:hidden"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Mails
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
