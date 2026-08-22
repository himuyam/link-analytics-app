'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-primary-600">
            🔗 LinkAnalytics
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span>{user.name}</span>
                  <span className="text-sm">⋮</span>
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                    <p className="px-4 py-2 text-sm text-gray-600 border-b">{user.email}</p>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/privacy"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      Privacy
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onLogout?.();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
