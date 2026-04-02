import './globals.css';

export const metadata = {
  title: 'Rent',
  description: 'Browse and rent items easily from our marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body>
        {children}
      </body>

    </html>
  );
}
