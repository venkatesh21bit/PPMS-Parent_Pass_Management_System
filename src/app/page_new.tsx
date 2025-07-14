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
        case 'WARDEN':
          router.push('/warden');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Parent Transport Management
            </h1>
            <p className="text-gray-600">
              Secure hostel visit management system
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
