// pages/404.tsx or app/not-found.tsx (depending on your Next.js version)
"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import {  ArrowLeft, Droplets, Heart} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const NotFoundPage: React.FC = () => {
  const router = useRouter();



  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="max-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className=" mx-auto text-center">
        <Card className="border-0   bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            {/* 404 Number with BloodBridge Theme */}
            <div className="">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Droplets className="w-10 h-10 text-red-500 animate-bounce" />
                <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  404
                </div>
                <Heart className="w-10 h-10 text-red-400 animate-pulse" />
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8 space-y-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                The page you're looking for seems to have donated itself to another location.
              </p>
              <p className="text-gray-500">
                Don't worry, we'll help you find your way back to saving lives!
              </p>
            </div>

            {/* BloodBridge Logo/Brand */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">BloodBridge</span>
              </div>
              <p className="text-sm text-gray-500">
                Connecting hearts, saving lives
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
      
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="border-red-200 cursor-pointer text-red-600 hover:bg-red-50 font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
            </div>

          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default NotFoundPage;
