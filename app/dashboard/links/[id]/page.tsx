'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, Skeleton } from '@/components/ui';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  consentRate: number;
  locationGrantRate: number;
  byCountry: Record<string, number>;
  byBrowser: Record<string, number>;
  byOs: Record<string, number>;
  byDevice: Record<string, number>;
  visitsOverTime: Record<string, number>;
}

export default function LinkAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const linkId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchAnalytics();
  }, [linkId]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) router.push('/login');
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${linkId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data.stats);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-64 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>No analytics data available</Card>
        </div>
      </div>
    );
  }

  const visitsData = Object.entries(analytics.visitsOverTime).map(([time, count]) => ({
    time: new Date(time).toLocaleString(),
    visits: count,
  }));

  const countryData = Object.entries(analytics.byCountry).map(([country, count]) => ({
    name: country,
    value: count,
  }));

  const browserData = Object.entries(analytics.byBrowser).map(([browser, count]) => ({
    name: browser,
    visits: count,
  }));

  const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Link Analytics</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-gray-600 text-sm">Total Visits</p>
            <p className="text-3xl font-bold">{analytics.totalVisits}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Unique Visitors</p>
            <p className="text-3xl font-bold">{analytics.uniqueVisitors}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Consent Rate</p>
            <p className="text-3xl font-bold">{analytics.consentRate.toFixed(1)}%</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Location Share Rate</p>
            <p className="text-3xl font-bold">{analytics.locationGrantRate.toFixed(1)}%</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <h2 className="text-xl font-bold mb-4">Visits Over Time</h2>
            {visitsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={visitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="#0ea5e9" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">No data</p>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4">Browsers</h2>
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={browserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">No data</p>
            )}
          </Card>
        </div>

        {/* Locations */}
        {countryData.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Top Countries</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={countryData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                  {countryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
