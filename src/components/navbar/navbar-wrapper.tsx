'use client';

import { usePathname } from 'next/navigation';
import DefaultNavbar from './default-navbar';
import AuthNavbar from './auth-navbar';

const NavbarWrapper = () => {
  const pathname = usePathname();
  
  // Don't show navbar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/register';
  if (isAuthPage) {
    return null;
  }

  // Show default navbar on home page
  if (pathname === '/') {
    return <DefaultNavbar />;
  }

  // Show main navbar on all other pages
  return <AuthNavbar />;
};

export default NavbarWrapper; 