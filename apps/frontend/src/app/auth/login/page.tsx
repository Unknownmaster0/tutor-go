'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

// Icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-indigo-600 transition-colors"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-indigo-600 transition-colors"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.9 3.23"/><path d="M17.75 17.75A10.5 10.5 0 0 1 12 19c-7 0-10-7-10-7a16.03 16.03 0 0 1 3.63-5.02"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-2"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(formData);

      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      if (redirect) {
        router.push(redirect);
      } else {
        if (user.role === 'tutor') {
          router.push('/dashboard/tutor');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Login form">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3" role="alert">
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-sm text-red-700 font-medium pt-0.5">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {isLoading ? (
                 <div className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Signing in...
                 </div>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 overflow-hidden">
        {/* Adjusted gradient direction to 'bl' (bottom-left) to point towards the center/form */}
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600 to-violet-700 opacity-90 z-10" />
        
        {/* Decorative Circles */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 opacity-20 rounded-full blur-3xl z-0" />
        
        <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full text-white">
          <div className="font-bold text-2xl tracking-tight flex items-center gap-2 justify-end">
             TutorGo <span className="bg-white/20 p-1.5 rounded-lg">🎓</span>
          </div>
          <div className="mb-12 text-right">
            <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome back!</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-md ml-auto">
              Ready to continue your learning journey? Sign in to access your personalized dashboard.
            </p>
            <div className="space-y-4 text-indigo-100 flex flex-col items-end">
              <div className="flex items-center gap-2"><span className="text-white">Track your progress</span> <CheckIcon /></div>
              <div className="flex items-center gap-2"><span className="text-white">Access course materials</span> <CheckIcon /></div>
              <div className="flex items-center gap-2"><span className="text-white">Schedule new sessions</span> <CheckIcon /></div>
            </div>
          </div>
          <div className="text-sm text-indigo-200 text-right">
            © 2025 TutorGo Platform. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}