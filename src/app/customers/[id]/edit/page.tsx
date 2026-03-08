'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Customer } from '@/types/customer';

interface CustomerWithStats extends Customer {
  deal_count: number;
  status: string;
  last_contact: string | null;
  referrer?: Customer;
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerSource, setCustomerSource] = useState<string>('orphan');
  const [gender, setGender] = useState<string>('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      fetchCustomer(p.id);
      fetchCustomers();
    });
  }, []);

  async function fetchCustomer(customerId: string) {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      setCustomer(data);
      setCustomerSource(data.source);
      setGender(data.gender || '');
      if (data.was_referred_by) {
        setSelectedReferrer(data.was_referred_by.toString());
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    } finally {
      setLoading(false);
    }
  }

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
        // 过滤掉当前客户自己
        setAllCustomers(data.filter((c: Customer) => c.id.toString() !== id));
      } else {
        console.error('Unexpected data format:', data);
        setAllCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setAllCustomers([]);
    }
  }

  function formatCustomerId(id: number): string {
    return `#${String(id).padStart(3, '0')}`;
  }

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    formatCustomerId(customer.id).includes(searchTerm)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      gender: gender,
      phone: formData.get('phone'),
      birthday: formData.get('birthday'),
      occupation: formData.get('occupation'),
      source: formData.get('source'),
      was_referred_by: customerSource === 'referral' && selectedReferrer ? parseInt(selectedReferrer) : null,
      address: formData.get('address'),
      family_info: formData.get('family_info'),
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/customers/${id}`);
      } else {
        alert('更新失败');
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('更新失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!customer) {
    return <div className="min-h-screen flex items-center justify-center">客户不存在</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/customers/${id}`} className="text-gray-600 hover:text-gray-900">
              ← 返回详情
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">编辑客户</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
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
                  defaultValue={customer.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  defaultValue={customer.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生日
                </label>
                <input
                  type="date"
                  name="birthday"
                  defaultValue={customer.birthday || ''}
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
                  defaultValue={customer.occupation || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">客户来源</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="source"
                  value="orphan"
                  required
                  defaultChecked={customer.source === 'orphan'}
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
                  defaultChecked={customer.source === 'referral'}
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
                  defaultChecked={customer.source === 'self'}
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
                  搜索推荐人
                </label>
                <input
                  type="text"
                  placeholder="输入姓名或手机号搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
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
              </div>
            )}
          </div>

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
                  defaultValue={customer.address || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  家庭情况
                </label>
                <textarea
                  name="family_info"
                  rows={2}
                  defaultValue={customer.family_info || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={customer.notes || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存客户'}
            </button>
            <Link
              href={`/customers/${id}`}
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
