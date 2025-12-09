import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login | TutorGo',
  description: 'Sign in to your TutorGo account',
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TutorGo</h1>
        <p className="text-gray-600 mt-2">Connect with expert tutors today</p>
      </div>

      <LoginForm />

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          New to TutorGo?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
