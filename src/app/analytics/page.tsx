'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Users, Phone, CheckCircle, Calendar } from 'lucide-react';

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: '拜访客户',
      value: stats.visits,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: '本月线下拜访次数',
    },
    {
      title: '成交保单',
      value: stats.deals,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: '本月成功成交数量',
    },
    {
      title: '电访次数',
      value: stats.calls,
      icon: Phone,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: '本月电话联系次数',
    },
    {
      title: '新增客户',
      value: stats.new_customers,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: '本月新增客户数',
    },
  ];

  const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <div className="container space-y-6 px-6 py-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="text-sm text-gray-500">查看本月业务数据和统计信息</p>
        </div>
      </div>

      {/* 时间范围 */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">统计时间</p>
              <p className="text-lg font-bold">{currentMonth}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.visits + stats.calls}</p>
            <p className="text-sm text-blue-100">总互动次数</p>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片网格 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor} ${card.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${card.color} mb-1`}>
                  {card.value}
                </div>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 数据洞察 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              转化率分析
            </CardTitle>
            <CardDescription>基于本月数据的转化情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">拜访转成交率</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.visits > 0 ? `${Math.round((stats.deals / stats.visits) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: stats.visits > 0 ? `${Math.min((stats.deals / stats.visits) * 100, 100)}%` : '0%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">总互动转成交率</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.visits + stats.calls > 0 ? `${Math.round((stats.deals / (stats.visits + stats.calls)) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: stats.visits + stats.calls > 0 ? `${Math.min((stats.deals / (stats.visits + stats.calls)) * 100, 100)}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              业务活动分析
            </CardTitle>
            <CardDescription>本月业务活动统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">线下拜访</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.visits} 次</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">电话联系</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.calls} 次</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">成功成交</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.deals} 单</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600">新增客户</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.new_customers} 人</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">总活动量</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stats.visits + stats.calls + stats.deals + stats.new_customers}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提示信息 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">数据洞察</p>
              <p className="mt-1 text-sm text-blue-700">
                本月共进行 <span className="font-semibold">{stats.visits + stats.calls}</span> 次客户互动，
                成功成交 <span className="font-semibold">{stats.deals}</span> 单，
                新增客户 <span className="font-semibold">{stats.new_customers}</span> 人。
                {stats.deals > 0 && '继续保持良好势头！'}
                {stats.deals === 0 && stats.visits > 0 && '建议加强跟进转化。'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
