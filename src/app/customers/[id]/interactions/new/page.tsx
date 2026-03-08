'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewInteractionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interactionType, setInteractionType] = useState<string>('call');

  useEffect(() => {
    params.then(p => {
      setCustomerId(p.id);
      fetchCustomerName(p.id);
    });
  }, []);

  async function fetchCustomerName(id: string) {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      setCustomerName(data.name);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get('type'),
      date: formData.get('date'),
      content: formData.get('content'),
      next_step: formData.get('next_step'),
    };

    try {
      const res = await fetch(`/api/customers/${customerId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/customers/${customerId}`);
      } else {
        alert('添加失败');
      }
    } catch (error) {
      console.error('Failed to create interaction:', error);
      alert('添加失败');
    } finally {
      setSubmitting(false);
    }
  }

  function getTypeLabel(type: string) {
    const labels = {
      call: '电话',
      wechat: '微信',
      meet: '见面',
      platform: '约平台',
      deal: '成交',
    };
    return labels[type as keyof typeof labels] || type;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/customers/${customerId}`} className="text-gray-600 hover:text-gray-900">
              ← 返回详情
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              为 <span className="text-blue-600">{customerName}</span> 添加互动记录
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* 互动类型 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">互动类型 <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-3 gap-3">
              {['call', 'wechat', 'meet', 'platform', 'deal'].map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    interactionType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={interactionType === type}
                    onChange={(e) => setInteractionType(e.target.value)}
                    required
                    className="text-blue-600"
                  />
                  <span>{getTypeLabel(type)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              defaultValue={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 内容记录 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容记录 <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              记录本次互动的详细内容（如：聊了什么产品、客户反馈等）
              {interactionType === 'deal' && ' - 成交时请记录产品名称、金额、缴费方式'}
            </p>
            <textarea
              name="content"
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：今天去拜访，送了茶叶，客户对养老险感兴趣，考虑中"
            />
          </div>

          {/* 下一步计划 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              下一步计划
            </label>
            <p className="text-sm text-gray-500 mb-2">
              例如：下周再电话跟进，推荐养老险产品
            </p>
            <textarea
              name="next_step"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：下周再联系"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '保存中...' : '保存记录'}
            </button>
            <Link
              href={`/customers/${customerId}`}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
