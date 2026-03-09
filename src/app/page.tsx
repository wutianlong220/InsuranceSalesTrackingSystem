'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerWithStats } from '@/types/customer';
import { formatCustomerId, calculateAge, getStatusColor } from '@/lib/utils';
import { handleError, showConfirm } from '@/lib/errorHandler';

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
      // 确保返回的是数组
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

    // 清除之前的定时器
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    // 设置新的定时器，300ms后执行搜索（防抖）
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
    // 性别筛选
    if (filterGender !== 'all') {
      if (filterGender === 'male' && customer.gender !== 'male') return false;
      if (filterGender === 'female' && customer.gender !== 'female') return false;
    }

    // 状态筛选
    if (filterStatus !== 'all' && customer.status !== filterStatus) {
      return false;
    }

    return true;
  });

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
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={() => {
              setFilterGender('all');
              setFilterStatus('all');
              setSearch('');
            }}
            className="text-2xl font-bold text-gray-900 hover:text-gray-700"
          >
            保险销售追踪系统
          </Link>
          <Link href="/analytics" className="text-blue-600 hover:text-blue-800">
            数据分析
          </Link>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="搜索客户姓名或手机号"
                className="px-4 py-2 border border-gray-300 rounded-lg w-80"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                搜索
              </button>
            </form>
            <Link
              href="/customers/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 添加客户
            </Link>
          </div>
        </div>
      </nav>

      {/* 客户列表区域 */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <div className="flex flex-col">
                    <span>性别</span>
                    <select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      className="mt-1 text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">全部</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年龄</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <div className="flex flex-col">
                    <span>状态</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="mt-1 text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">全部</option>
                      <option value="刚成交">刚成交</option>
                      <option value="跟踪中">跟踪中</option>
                      <option value="已见面">已见面</option>
                      <option value="已约平台">已约平台</option>
                      <option value="新客户">新客户</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成交次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后联系</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        查看
                      </Link>
                      <Link
                        href={`/customers/${customer.id}/edit`}
                        className="text-green-600 hover:text-green-800"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                    {formatCustomerId(customer.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {customer.birthday ? calculateAge(customer.birthday) + '岁' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {customer.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {customer.deal_count} 次
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {customer.last_contact || '无记录'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无符合条件的客户数据</div>
          )}
          {customers.length > 0 && filteredCustomers.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-400">提示：调整筛选条件以查看更多客户</div>
          )}
        </div>
      </div>
    </div>
  );
}
