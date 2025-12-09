import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './animations.css';
import { AuthProvider } from '@/contexts/auth-context';
import PageTransition from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TutorGo - Find Your Perfect Tutor',
  description: 'Location-based tutor booking platform connecting students with qualified tutors',
  keywords: ['tutor', 'education', 'learning', 'booking', 'online tutoring'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
