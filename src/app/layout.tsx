import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Library Management System`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'School Library Management System for Kenyan Schools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0B0B0F]">
        {children}
      </body>
    </html>
  );
}
