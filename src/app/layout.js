import { Fraunces, Montserrat } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata = {
  title: 'Nicholas Ivan Portfolio',
  description:
    'Portofolio milik Nicholas Ivan (FullStack Developer & Machine Learning Specialist).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
