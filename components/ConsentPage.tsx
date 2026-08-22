'use client';

import React, { useEffect, useState } from 'react';
import { Button, Toast } from './ui';

interface ConsentPageProps {
  linkName?: string;
  onConsent: (consent: boolean) => Promise<void>;
  onLocationShare?: () => Promise<void>;
}

export function ConsentPage({
  linkName = 'the link creator',
  onConsent,
  onLocationShare,
}: ConsentPageProps) {
  const [step, setStep] = useState<'consent' | 'location' | 'redirecting'>('consent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConsent = async (consentGiven: boolean) => {
    setLoading(true);
    setError('');

    try {
      await onConsent(consentGiven);

      if (consentGiven) {
        setStep('location');
      } else {
        setStep('redirecting');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationShare = async () => {
    setLoading(true);
    setError('');

    try {
      await onLocationShare?.();
      setStep('redirecting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'redirecting') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full animate-slide-up">
        {error && <Toast message={error} type="error" onClose={() => setError('')} />}

        {step === 'consent' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome</h1>
              <p className="text-gray-600">
                This link is tracked by {linkName} to understand how people engage with their content.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold mb-2">📊 What we collect:</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ When you opened this link</li>
                <li>✓ Your approximate location (from IP address)</li>
                <li>✓ Your browser and device type</li>
                <li>✓ Where you came from (referrer)</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="font-semibold mb-2">🎯 Optional:</h2>
              <p className="text-sm text-gray-600">
                We can ask for your precise location (GPS), but only if you agree. This requires
                your browser permission.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleConsent(true)}
                loading={loading}
                className="w-full"
              >
                Share Data
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleConsent(false)}
                loading={loading}
                className="w-full"
              >
                Continue Without Sharing
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your privacy is important. All data is handled according to our privacy policy.
            </p>
          </div>
        )}

        {step === 'location' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Share Your Location?</h1>
              <p className="text-gray-600">
                To provide {linkName} with more precise location data, your browser will ask for
                permission to access your GPS coordinates.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="font-semibold mb-2">⚠️ Important:</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• This is completely optional</li>
                <li>• Your browser will show a permission prompt</li>
                <li>• You can deny this at any time</li>
                <li>• Location data is kept private</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleLocationShare}
                loading={loading}
                className="w-full"
              >
                Allow Location Access
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep('redirecting')}
                loading={loading}
                className="w-full"
              >
                Skip Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
