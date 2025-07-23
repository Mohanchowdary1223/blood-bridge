import HomeComponent from '../home';
import { useEffect } from 'react';

export default function DonorHome() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Debug log for troubleshooting
        console.log('Current user:', user);
        console.log('Signup reason:', user.signupReason);
      }
    }
  }, []);
  // Donor sees the regular home page (all features)
  return <HomeComponent />;
}