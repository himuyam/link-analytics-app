'use client';

import React from 'react';
import { Card } from './ui';

interface LinkCardProps {
  slug: string;
  name: string;
  visits: number;
  createdAt: Date;
  active: boolean;
  onView: () => void;
  onEdit: () => void;
  onDisable: () => void;
  onDelete: () => void;
}

export function LinkCard({
  slug,
  name,
  visits,
  createdAt,
  active,
  onView,
  onEdit,
  onDisable,
  onDelete,
}: LinkCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const linkUrl = `${appUrl}/l/${slug}`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">{slug}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {active ? 'Active' : 'Disabled'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm">
          <span className="text-gray-600">Visits:</span> <span className="font-semibold">{visits}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600">Created:</span> <span className="font-semibold">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </p>
      </div>

      <div className="bg-gray-50 p-3 rounded mb-4 break-all">
        <p className="text-xs text-gray-600 mb-2">Link URL:</p>
        <p className="text-sm font-mono text-primary-600">{linkUrl}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onView}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Analytics
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Edit
        </button>
        {active && (
          <button
            onClick={onDisable}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
          >
            Disable
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </Card>
  );
}
