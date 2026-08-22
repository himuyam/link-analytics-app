'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConsentPage } from '@/components/ConsentPage';
import { Toast } from '@/components/ui';

export default function VisitTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsent = async (consentGiven: boolean) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/visits/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentGiven,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to record visit');
      }

      const data = await response.json();
      setVisitorId(data.visitor.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationShare = async () => {
    if (!visitorId) throw new Error('No visitor ID');

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(`/api/visits/${visitorId}/location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to store location');
            }

            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        (err) => {
          reject(new Error(`Geolocation error: ${err.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const redirectToLink = () => {
    // In a real app, fetch the actual destination URL
    // For now, just redirect to home
    window.location.href = 'https://example.com';
  };

  return (
    <div>
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      <ConsentPage
        linkName="the link creator"
        onConsent={handleConsent}
        onLocationShare={visitorId ? handleLocationShare : undefined}
      />
    </div>
  );
}
