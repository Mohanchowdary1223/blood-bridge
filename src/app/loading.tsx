// components/ui/SimpleBloodLoader.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';

interface SimpleBloodLoaderProps {
  message?: string;
  duration?: number; // in milliseconds
  onComplete?: () => void; // callback when loading is done
}

const SimpleBloodLoader: React.FC<SimpleBloodLoaderProps> = ({ 
  message = 'Loading...',
  duration = 2000, // 2 seconds default
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center space-y-4">
        <Droplets className="w-10 h-10 text-red-500 animate-bounce" />
        {message && (
          <p className="text-gray-600 text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SimpleBloodLoader;
