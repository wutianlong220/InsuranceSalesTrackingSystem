'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerWithStats } from '@/types/customer';
import { formatCustomerId, calculateAge } from '@/lib/utils';
import { handleError, showConfirm } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Edit, Trash2, Eye, Phone } from 'lucide-react';

export default function HomePage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTimeoutId, setSearchTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) {
        throw new Error('获取客户列表失败');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (error) {
      handleError(error, { fallbackMessage: '获取客户列表失败', showAlert: false });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch(search);
  }

  function performSearch(searchTerm: string) {
    if (!searchTerm) {
      fetchCustomers();
      return;
    }

    fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('搜索失败');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          throw new Error('数据格式错误');
        }
      })
      .catch(error => {
        handleError(error, { fallbackMessage: '搜索客户失败', showAlert: false });
        setCustomers([]);
      });
  }

  function handleSearchChange(value: string) {
    setSearch(value);

    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      if (!value) {
        fetchCustomers();
      } else {
        performSearch(value);
      }
    }, 300);

    setSearchTimeoutId(newTimeoutId);
  }

  async function handleDelete(id: number) {
    if (!showConfirm('确定要删除此客户吗？此操作不可恢复，且会删除所有相关互动记录。')) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      fetchCustomers();
    } catch (error) {
      handleError(error, { fallbackMessage: '删除客户失败' });
    }
  }

  // 应用所有筛选条件
  const filteredCustomers = customers.filter((customer) => {
    if (filterGender !== 'all') {
      if (filterGender === 'male' && customer.gender !== 'male') return false;
      if (filterGender === 'female' && customer.gender !== 'female') return false;
    }

    if (filterStatus !== 'all' && customer.status !== filterStatus) {
      return false;
    }

    return true;
  });

  // 计算统计数据
  const stats = {
    total: customers.length,
    newCustomers: customers.filter(c => c.status === '新客户').length,
    tracking: customers.filter(c => c.status === '跟踪中').length,
    dealCustomers: customers.filter(c => c.deal_count > 0).length, // 已成交客户数
    dealOrders: customers.reduce((sum, c) => sum + (c.deal_count || 0), 0), // 已成交订单数
  };

  function getStatusBadgeVariant(status: string): "default" | "success" | "warning" | "destructive" | "outline" | "secondary" {
    switch (status) {
      case '刚成交': return 'success';
      case '跟踪中': return 'warning';
      case '已见面': return 'default';
      case '已约平台': return 'default';
      case '新客户': return 'secondary';
      default: return 'secondary';
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

  return (
    <div className="container space-y-8 px-6 py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">客户列表</h1>
          <p className="mt-2 text-sm text-gray-600">
            管理和追踪您的所有客户信息
          </p>
        </div>
        <Link href="/customers/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            添加客户
          </Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              总客户数
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="mt-1 text-xs text-gray-500">所有客户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              新客户
            </CardTitle>
            <UserPlus className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.newCustomers}</div>
            <p className="mt-1 text-xs text-gray-500">待跟进</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              跟踪中
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.tracking}</div>
            <p className="mt-1 text-xs text-gray-500">正在跟进</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              已成交客户数
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.dealCustomers}</div>
            <p className="mt-1 text-xs text-gray-500">成交客户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              已成交订单数
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.dealOrders}</div>
            <p className="mt-1 text-xs text-gray-500">成交订单</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="搜索客户姓名或手机号..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                搜索
              </Button>
            </form>

            {/* 筛选器 */}
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="all">全部性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="all">全部状态</option>
                <option value="刚成交">刚成交</option>
                <option value="跟踪中">跟踪中</option>
                <option value="已见面">已见面</option>
                <option value="已约平台">已约平台</option>
                <option value="新客户">新客户</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 客户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>客户列表</CardTitle>
          <CardDescription>
            共 {filteredCustomers.length} 位客户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-6 py-3">客户信息</th>
                  <th className="px-6 py-3">性别</th>
                  <th className="px-6 py-3">年龄</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">联系方式</th>
                  <th className="px-6 py-3">成交次数</th>
                  <th className="px-6 py-3">最后联系</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{formatCustomerId(customer.id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.birthday ? calculateAge(customer.birthday) + '岁' : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(customer.status)}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {customer.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {customer.deal_count} 次
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.last_contact || '无记录'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/customers/${customer.id}`}>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Eye className="h-3 w-3" />
                            查看
                          </Button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Edit className="h-3 w-3" />
                            编辑
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">暂无符合条件的客户数据</p>
              </div>
            )}

            {customers.length > 0 && filteredCustomers.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-400">提示：调整筛选条件以查看更多客户</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 添加缺失的图标导入
import { Users, UserPlus, TrendingUp, CheckCircle } from 'lucide-react';
