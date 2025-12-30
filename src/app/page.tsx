'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Loading from '@/components/ui/Loading';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'PARENT':
          router.push('/parent');
          break;
        case 'SECURITY':
          router.push('/security');
          break;
        case 'HOSTEL_WARDEN':
          // Redirect to appropriate hostel portal based on hostelName
          if (user.hostelName === 'Agasthya Bhavanam') {
            router.push('/hostel/agasthya');
          } else if (user.hostelName === 'Vasishta Bhavanam') {
            router.push('/hostel/vasishta');
          } else if (user.hostelName === 'Gautama Bhavanam') {
            router.push('/hostel/gautama');
          } else {
            router.push('/hostel/agasthya'); // Default fallback
          }
          break;
        case 'WARDEN':
          // Legacy support - redirect to Agasthya by default
          router.push('/hostel/agasthya');
          break;
        default:
          break;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Loading />; // Show loading while redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Parent Transport Management
            </h1>
            <p className="text-gray-300">
              Secure hostel visit management system
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
