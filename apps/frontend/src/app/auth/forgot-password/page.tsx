import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | TutorGo',
  description: 'Reset your TutorGo password',
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TutorGo</h1>
        <p className="text-gray-600 mt-2">Get back to learning</p>
      </div>

      <ForgotPasswordForm />
    </>
  );
}
