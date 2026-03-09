'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerWithStats } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import { formatCustomerId, calculateAge, getInteractionTypeColor } from '@/lib/utils';
import { handleError, showConfirm } from '@/lib/errorHandler';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      fetchCustomer(p.id);
      fetchInteractions(p.id);
    });
  }, []);

  async function fetchCustomer(customerId: string) {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (!res.ok) {
        throw new Error('获取客户信息失败');
      }
      const data = await res.json();
      setCustomer(data);
    } catch (error) {
      handleError(error, { fallbackMessage: '获取客户信息失败', showAlert: false });
    }
  }

  async function fetchInteractions(customerId: string) {
    try {
      const res = await fetch(`/api/customers/${customerId}/interactions`);
      if (!res.ok) {
        throw new Error('获取互动记录失败');
      }
      const data = await res.json();
      // 确保返回的是数组
      if (Array.isArray(data)) {
        setInteractions(data);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (error) {
      handleError(error, { fallbackMessage: '获取互动记录失败', showAlert: false });
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!showConfirm('确定要删除此客户吗？此操作不可恢复，且会删除所有相关互动记录。')) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      window.location.href = '/';
    } catch (error) {
      handleError(error, { fallbackMessage: '删除客户失败' });
    }
  }

  async function handleDeleteInteraction(interactionId: number) {
    if (!showConfirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/interactions/${interactionId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      fetchInteractions(id!);
      fetchCustomer(id!);
    } catch (error) {
      handleError(error, { fallbackMessage: '删除记录失败' });
    }
  }

  function getInteractionTypeLabel(type: string) {
    const labels = {
      call: '电话',
      wechat: '微信',
      meet: '见面',
      platform: '约平台',
      deal: '成交',
    };
    return labels[type as keyof typeof labels] || type;
  }

  function formatDate(date: string | null): string {
    if (!date) return '-';
    return date.split('T')[0];
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!customer) {
    return <div className="min-h-screen flex items-center justify-center">客户不存在</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← 返回列表
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">客户详情</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/customers/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              编辑
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </nav>

      <div className="flex p-6 gap-6">
        {/* 左侧信息卡片 */}
        <div className="w-96 space-y-6">
          {/* 客户基本信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{formatCustomerId(customer.id)} {customer.name}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">性别:</span>
                <span>{customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">手机:</span>
                <span>{customer.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">生日:</span>
                <span>{formatDate(customer.birthday)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">年龄:</span>
                <span>{customer.birthday ? calculateAge(customer.birthday) + '岁' : '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">职业:</span>
                <span>{customer.occupation || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">来源:</span>
                <span>
                  {customer.source === 'orphan' ? '孤儿保单' : customer.source === 'referral' ? '客户推荐' : '自主开发'}
                </span>
              </div>
              {customer.referrer && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-20">推荐人:</span>
                  <Link
                    href={`/customers/${customer.referrer.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {formatCustomerId(customer.referrer.id)} {customer.referrer.name}
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20">地址:</span>
                <span>{customer.address || '-'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 w-20">家庭:</span>
                <span>{customer.family_info || '-'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 w-20">备注:</span>
                <span>{customer.notes || '-'}</span>
              </div>
            </div>
          </div>

          {/* 统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">成交记录</h3>
            <div className="text-3xl font-bold text-green-600">{customer.deal_count} 次</div>
            <div className="text-sm text-gray-500 mt-1">
              {customer.status === '刚成交' ? '最近有成交' : '暂无最近成交'}
            </div>
          </div>
        </div>

        {/* 右侧互动记录 */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">互动记录</h2>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">筛选类型: 全部</option>
                  <option value="deal">成交</option>
                  <option value="meet">见面</option>
                  <option value="call">电话</option>
                  <option value="wechat">微信</option>
                  <option value="platform">约平台</option>
                </select>
              </div>
              <Link
                href={`/customers/${id}/interactions/new`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + 添加记录
              </Link>
            </div>

            <div className="space-y-4">
              {interactions
                .filter((interaction) => filterType === 'all' || interaction.type === filterType)
                .map((interaction) => (
                <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getInteractionTypeColor(interaction.type)}`}>
                        {getInteractionTypeLabel(interaction.type)}
                      </span>
                      <span className="text-sm text-gray-500">{interaction.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/interactions/${interaction.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteInteraction(interaction.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-900">{interaction.content}</div>
                  {interaction.next_step && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">下一步: </span>
                      {interaction.next_step}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {interactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">暂无互动记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
