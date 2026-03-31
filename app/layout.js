import './globals.css';

export const metadata = {
  title: 'Report Ludhiana Newspaper - ਹਰ ਕਦਮ ਤੁਹਾਡੇ ਨਾਲ',
  description: 'Report Ludhiana Newspaper - Your trusted source for Ludhiana local news, Punjab news, videos, photos and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Noto+Sans+Gurmukhi:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
