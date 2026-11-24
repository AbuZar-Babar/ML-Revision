import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ML Studio Lab — Interactive Machine Learning Teaching Platform',
  description:
    'Interactive 7-stage machine learning teaching and simulation platform for undergraduate courses, featuring live-linked equations, overfitting demos, Socratic visual proofs, and classic Python lab assignments.',
  openGraph: {
    title: 'ML Studio Lab — Interactive Machine Learning Teaching Platform',
    description:
      'Master machine learning concepts visually before writing code with 7 interactive simulations, live math equations, and classic university lab datasets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Studio Lab — Interactive Machine Learning Teaching Platform',
    description:
      'Interactive 7-stage machine learning teaching platform with live simulations, Socratic visual proofs, and Python lab templates.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] antialiased selection:bg-sky-200 dark:selection:bg-sky-900 selection:text-slate-900 dark:selection:text-white transition-colors duration-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
