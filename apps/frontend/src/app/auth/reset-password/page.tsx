import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | TutorGo',
  description: 'Create a new password for your TutorGo account',
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TutorGo</h1>
        <p className="text-gray-600 mt-2">Secure your account</p>
      </div>

      <ResetPasswordForm />
    </>
  );
}
