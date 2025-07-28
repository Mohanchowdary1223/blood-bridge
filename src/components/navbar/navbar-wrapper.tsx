'use client';


import { usePathname } from 'next/navigation';
import DefaultNavbar from './default-navbar';
import AuthNavbar from './auth-navbar';
import DonorNavbar from './donor-navbar';
import React, { useEffect, useState } from 'react';


const NavbarWrapper = () => {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setRole(user.role || null);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    }
  }, [typeof window !== 'undefined' && localStorage.getItem('user')]);

  // Don't show navbar on auth, admin, or blocked-home pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');
  const isBlockedPage = pathname.startsWith('/blocked-home');
  if (isAuthPage || isAdminPage || isBlockedPage) {
    return null;
  }

  if (pathname === '/' || pathname === '/healthbotai') {
    return <DefaultNavbar />;
  }

  // Show donor navbar for donor role
  if (role === 'donor') {
    return <DonorNavbar />;
  }

  // Show main navbar on all other pages
  return <AuthNavbar />;
};

export default NavbarWrapper; 