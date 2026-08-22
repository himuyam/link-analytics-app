'use client';

import React, { useState } from 'react';
import { Button, Toast } from './ui';

interface LinkFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function LinkForm({ onSubmit, loading = false }: LinkFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [retentionDays, setRetentionDays] = useState(30);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Link name is required');
      return;
    }

    if (!url.trim()) {
      setError('Destination URL is required');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Invalid URL');
      return;
    }

    try {
      await onSubmit({ name, destinationUrl: url, retentionDays });
      setName('');
      setUrl('');
      setRetentionDays(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}

      <div>
        <label className="block text-sm font-medium mb-2">Link Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My awesome link"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Destination URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Data Retention (days)</label>
        <select
          value={retentionDays}
          onChange={(e) => setRetentionDays(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={365}>365 days</option>
        </select>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create Link
      </Button>
    </form>
  );
}
