import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LinkAnalytics - Privacy-Respecting Link Analytics',
  description: 'Create shareable links with consent-based analytics and location tracking',
  openGraph: {
    title: 'LinkAnalytics',
    description: 'Privacy-respecting link analytics platform',
    url: 'https://linkanalytics.app',
    siteName: 'LinkAnalytics',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
