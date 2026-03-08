'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ visits: 0, calls: 0, deals: 0, new_customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats/monthly');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← 返回列表
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
        </div>
      </nav>

      {/* 统计卡片 */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.visits}</div>
            <div className="text-sm text-gray-600">拜访客户</div>
            <div className="text-xs text-gray-400 mt-1">本月统计</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats.deals}</div>
            <div className="text-sm text-gray-600">成交保单</div>
            <div className="text-xs text-gray-400 mt-1">本月统计</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.calls}</div>
            <div className="text-sm text-gray-600">电访次数</div>
            <div className="text-xs text-gray-400 mt-1">本月统计</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.new_customers}</div>
            <div className="text-sm text-gray-600">新增客户</div>
            <div className="text-xs text-gray-400 mt-1">本月统计</div>
          </div>
        </div>
      </div>
    </div>
  );
}
