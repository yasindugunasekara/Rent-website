import './globals.css';
// Import the optimized Inter font from Next.js
import { Inter } from 'next/font/google';

// Configure the font (loads instantly, prevents layout shifts)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

// Enhanced SEO Metadata for a Global Marketplace
export const metadata = {
  title: {
    default: 'RentAnything | Global Rental Marketplace',
    template: '%s | RentAnything', // Dynamic titles for sub-pages
  },
  description: 'Discover, rent, and list anything you need from people around the world. A secure, fast, and easy global marketplace.',
  keywords: ['rent items', 'global marketplace', 'peer-to-peer rental', 'borrow'],
  openGraph: {
    title: 'RentAnything | Global Rental Marketplace',
    description: 'Discover, rent, and list anything you need from people around the world.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply the Inter font class globally.
        min-h-screen ensures the page always takes full height.
      */}
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Main content area flex-grow ensures it pushes a future footer to the bottom 
        */}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}