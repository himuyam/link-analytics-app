'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, Button, Toast, Skeleton } from '@/components/ui';
import { LinkForm } from '@/components/LinkForm';
import { LinkCard } from '@/components/LinkCard';

interface Link {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  createdAt: string;
  analytics?: {
    totalVisits: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchLinks();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data.links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (formData: any) => {
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create link');
      }

      setSuccess('Link created successfully!');
      setShowForm(false);
      fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Toast message={error} type="error" onClose={() => setError('')} />
        )}
        {success && (
          <Toast message={success} type="success" onClose={() => setSuccess('')} />
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Links</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create New Link'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-4">Create a New Link</h2>
            <LinkForm onSubmit={handleCreateLink} loading={creating} />
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No links yet. Create your first one!</p>
            <Button onClick={() => setShowForm(true)}>Create Link</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                slug={link.slug}
                name={link.name}
                visits={link.analytics?.totalVisits || 0}
                createdAt={new Date(link.createdAt)}
                active={link.active}
                onView={() => router.push(`/dashboard/links/${link.id}`)}
                onEdit={() => router.push(`/dashboard/links/${link.id}/edit`)}
                onDisable={async () => {
                  try {
                    await fetch(`/api/links/${link.id}/disable`, { method: 'POST' });
                    setSuccess('Link disabled');
                    fetchLinks();
                  } catch (err) {
                    setError('Failed to disable link');
                  }
                }}
                onDelete={async () => {
                  if (confirm('Are you sure? This will delete all visitor data.')) {
                    try {
                      await fetch(`/api/links/${link.id}`, { method: 'DELETE' });
                      setSuccess('Link deleted');
                      fetchLinks();
                    } catch (err) {
                      setError('Failed to delete link');
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
