'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { AdminMetrics, RecentActivity, RevenueData, BookingData } from '@/types/admin.types';
import { MetricCard } from '@/components/admin/metric-card';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { BookingsChart } from '@/components/admin/bookings-chart';
import { ActivityFeed } from '@/components/admin/activity-feed';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, activityData, revenueData, bookingData] = await Promise.all([
          apiClient.get<AdminMetrics>('/admin/metrics'),
          apiClient.get<RecentActivity[]>('/admin/activity'),
          apiClient.get<RevenueData[]>('/admin/revenue'),
          apiClient.get<BookingData[]>('/admin/bookings'),
        ]);

        setMetrics(metricsData);
        setRecentActivity(Array.isArray(activityData) ? activityData : []);
        setRevenueData(Array.isArray(revenueData) ? revenueData : []);
        setBookingData(Array.isArray(bookingData) ? bookingData : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor platform activity and key metrics</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            subtitle={`${metrics?.totalStudents || 0} students, ${metrics?.totalTutors || 0} tutors`}
            icon={<span className="text-4xl">👥</span>}
          />
          <MetricCard
            title="Total Bookings"
            value={metrics?.totalBookings || 0}
            subtitle={`${metrics?.recentBookings || 0} this week`}
            icon={<span className="text-4xl">📅</span>}
          />
          <MetricCard
            title="Total Revenue"
            value={`$${(metrics?.totalRevenue || 0).toFixed(2)}`}
            subtitle={`$${(metrics?.recentRevenue || 0).toFixed(2)} this week`}
            icon={<span className="text-4xl">💰</span>}
          />
          <MetricCard
            title="Active Sessions"
            value="--"
            subtitle="Real-time tracking"
            icon={<span className="text-4xl">🔴</span>}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data={revenueData} />
          <BookingsChart data={bookingData} />
        </div>

        {/* Recent Activity */}
        <ActivityFeed activities={recentActivity} />

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <span className="text-3xl mb-2 block">👤</span>
            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage user accounts</p>
          </button>
          <button
            onClick={() => router.push('/admin/moderation')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <span className="text-3xl mb-2 block">🛡️</span>
            <h3 className="text-lg font-semibold text-gray-900">Content Moderation</h3>
            <p className="text-sm text-gray-600 mt-1">Review flagged content</p>
          </button>
          <button
            onClick={() => router.push('/admin/transactions')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <span className="text-3xl mb-2 block">💳</span>
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-600 mt-1">View payment history</p>
          </button>
        </div>
      </div>
    </div>
  );
}
