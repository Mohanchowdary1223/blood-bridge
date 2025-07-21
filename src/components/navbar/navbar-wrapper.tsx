'use client';

import { usePathname } from 'next/navigation';
import DefaultNavbar from './default-navbar';
import AuthNavbar from './auth-navbar';

const NavbarWrapper = () => {
  const pathname = usePathname();
  
  // Don't show navbar on auth or admin pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');
  if (isAuthPage || isAdminPage) {
    return null;
  }

  // Show default navbar on home and emergency-blood page
  if (pathname === '/' || pathname === '/emergency-blood') {
    return <DefaultNavbar />;
  }

  // Show main navbar on all other pages
  return <AuthNavbar />;
};

export default NavbarWrapper; 