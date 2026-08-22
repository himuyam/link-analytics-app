'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">🔗 LinkAnalytics</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Track Links with Privacy in Mind
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create shareable links with built-in analytics. Collect location data only with explicit visitor consent.
          Privacy-respecting, GDPR-friendly, and transparent.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button className="text-lg px-8 py-3">Get Started Free</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="text-lg px-8 py-3">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg p-8 shadow-md">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">Link Analytics</h3>
          <p className="text-gray-600">
            See how many times your links are opened, when they\'re visited, and where visitors come from.
          </p>
        </div>
        <div className="bg-white rounded-lg p-8 shadow-md">
          <div className="text-3xl mb-4">📍</div>
          <h3 className="text-xl font-bold mb-2">Consent-Based Location</h3>
          <p className="text-gray-600">
            Optional GPS tracking with explicit visitor consent. Transparent about what data is collected.
          </p>
        </div>
        <div className="bg-white rounded-lg p-8 shadow-md">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Privacy First</h3>
          <p className="text-gray-600">
            GDPR compliant, no fingerprinting, no tracking IDs. Your visitors\' privacy is protected.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2024 LinkAnalytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
