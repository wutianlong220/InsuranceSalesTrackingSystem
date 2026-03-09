'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCustomerId } from '@/lib/utils';

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerSource, setCustomerSource] = useState<string>('orphan');
  const [gender, setGender] = useState<string>('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) {
        console.error('Failed to fetch customers:', res.statusText);
        setAllCustomers([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllCustomers(data);
      } else {
        console.error('Unexpected data format:', data);
        setAllCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setAllCustomers([]);
    }
  }

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    formatCustomerId(customer.id).includes(searchTerm)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      gender: gender,
      phone: formData.get('phone'),
      birthday: formData.get('birthday'),
      occupation: formData.get('occupation'),
      source: formData.get('source'),
      was_referred_by: customerSource === 'referral' && selectedReferrer ? parseInt(selectedReferrer) : undefined,
      address: formData.get('address'),
      family_info: formData.get('family_info'),
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const customer = await res.json();
        router.push(`/customers/${customer.id}`);
      } else {
        // 尝试解析错误信息
        const errorData = await res.json().catch(() => ({ error: '创建失败' }));

        // 显示具体的错误信息
        if (errorData.error) {
          alert(errorData.error);
        } else {
          alert('创建失败');
        }
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('创建失败');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">添加客户</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* 基本信息 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入客户姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性别
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={(e) => setGender(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>男</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={(e) => setGender(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>女</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入手机号码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生日
                </label>
                <input
                  type="date"
                  name="birthday"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  职业
                </label>
                <input
                  type="text"
                  name="occupation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入职业"
                />
              </div>
            </div>
          </div>

          {/* 客户来源 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">客户来源</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="source"
                  value="orphan"
                  required
                  checked={customerSource === 'orphan'}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="text-blue-600"
                />
                <span>孤儿保单（公司分配）</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="source"
                  value="referral"
                  checked={customerSource === 'referral'}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="text-blue-600"
                />
                <span>客户推荐</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="source"
                  value="self"
                  checked={customerSource === 'self'}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="text-blue-600"
                />
                <span>自主开发</span>
              </label>
            </div>

            {/* 推荐人选择器 - 仅当选择"客户推荐"时显示 */}
            {customerSource === 'referral' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  搜索推荐人 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入姓名或手机号搜索..."
                    value={searchTerm}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSearchTerm(newValue);
                      // 如果用户修改了搜索框内容，清除之前选择的推荐人
                      if (selectedReferrer && newValue !== searchTerm) {
                        setSelectedReferrer('');
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedReferrer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReferrer('');
                        setSearchTerm('');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      清除
                    </button>
                  )}
                </div>
                {/* 只在搜索中且没有选择推荐人时显示搜索结果 */}
                {searchTerm && !selectedReferrer && (
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">未找到匹配的客户</div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setSelectedReferrer(customer.id.toString());
                            setSearchTerm(`${formatCustomerId(customer.id)} ${customer.name}`);
                          }}
                          className={`px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-blue-50 ${
                            selectedReferrer === customer.id.toString() ? 'bg-blue-100' : ''
                          }`}
                      >
                        <div className="font-medium text-gray-900">
                          {formatCustomerId(customer.id)} {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phone || '无手机号'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                )}
                <input
                  type="hidden"
                  name="was_referred_by"
                  value={selectedReferrer}
                  required={customerSource === 'referral'}
                />
              </div>
            )}
          </div>

          {/* 其他信息 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">其他信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地址
                </label>
                <textarea
                  name="address"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  家庭情况
                </label>
                <textarea
                  name="family_info"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：已婚，有一子"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="其他备注信息..."
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存客户'}
            </button>
            <Link
              href="/"
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
