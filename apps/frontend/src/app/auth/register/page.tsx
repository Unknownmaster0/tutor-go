'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentRegistrationForm } from '@/components/auth/StudentRegistrationForm';
import { TutorRegistrationForm } from '@/components/auth/TutorRegistrationForm';

export default function RegisterPage() {
  const [userType, setUserType] = useState<'student' | 'tutor' | null>(null);

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TutorGo</h1>
        <p className="text-gray-600 mt-2">Join the learning community</p>
      </div>

      {!userType ? (
        <div className="space-y-4">
          <p className="text-center text-gray-600 mb-6">Who are you?</p>
          <button
            onClick={() => setUserType('student')}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition text-gray-900 font-medium"
          >
            I'm a Student
          </button>
          <button
            onClick={() => setUserType('tutor')}
            className="w-full px-4 py-3 border-2 border-green-300 rounded-lg hover:bg-green-50 transition text-gray-900 font-medium"
          >
            I'm a Tutor
          </button>
        </div>
      ) : userType === 'student' ? (
        <>
          <StudentRegistrationForm />
          <button
            onClick={() => setUserType(null)}
            className="mt-4 text-center text-sm text-gray-600 hover:text-gray-900 w-full"
          >
            ← Back to role selection
          </button>
        </>
      ) : (
        <>
          <TutorRegistrationForm />
          <button
            onClick={() => setUserType(null)}
            className="mt-4 text-center text-sm text-gray-600 hover:text-gray-900 w-full"
          >
            ← Back to role selection
          </button>
        </>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
