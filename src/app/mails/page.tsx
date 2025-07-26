"use client"
import Mails from '@/components/mails/mails';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MailsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Set userId in localStorage if not already set
          if (user._id && !localStorage.getItem('userId')) {
            localStorage.setItem('userId', user._id);
          }
          if (user.role !== 'donor') {
            router.replace('/home');
          }
        } catch {
          router.replace('/home');
        }
      } else {
        router.replace('/home');
      }
    }
  }, [router]);
  return <Mails />;
}