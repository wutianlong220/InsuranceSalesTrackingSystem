'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Customer } from '@/types/customer';
import { formatCustomerId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Phone, Cake, Briefcase, MapPin, FileText, Search } from 'lucide-react';

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

      // 如果有推荐人，设置搜索框显示推荐人信息
      if (data.referrer) {
        setSelectedReferrer(data.referrer.id.toString());
        setSearchTerm(`${formatCustomerId(data.referrer.id)} ${data.referrer.name}`);
      } else if (data.was_referred_by) {
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

  const filteredCustomers = allCustomers.filter(c =>
    c.id !== parseInt(id) && // 排除当前正在编辑的客户
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.phone?.includes(searchTerm) ||
     formatCustomerId(c.id).includes(searchTerm))
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
        const errorData = await res.json().catch(() => ({ error: '更新失败' }));
        if (errorData.error) {
          alert(errorData.error);
        } else {
          alert('更新失败');
        }
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('更新失败');
    } finally {
      setSaving(false);
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

  if (!customer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium text-gray-900">客户不存在</p>
            <p className="mt-2 text-sm text-gray-500">未找到该客户信息</p>
            <Link href="/" className="mt-4 inline-block">
              <Button>返回列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl space-y-6 px-6 py-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Link href={`/customers/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回详情
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">编辑客户信息</h1>
          <p className="text-sm text-gray-500">修改客户的基本信息和详细资料</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>必填项请务必填写完整</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={customer.name}
                  placeholder="请输入客户姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">男</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">女</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  手机号
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={customer.phone || ''}
                  placeholder="请输入手机号码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday" className="flex items-center gap-2">
                  <Cake className="h-4 w-4" />
                  生日
                </Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  defaultValue={customer.birthday || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                职业
              </Label>
              <Input
                id="occupation"
                name="occupation"
                type="text"
                defaultValue={customer.occupation || ''}
                placeholder="请输入职业"
              />
            </div>
          </CardContent>
        </Card>

        {/* 客户来源 */}
        <Card>
          <CardHeader>
            <CardTitle>客户来源</CardTitle>
            <CardDescription>选择该客户的获取渠道</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                customerSource === 'orphan'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="source"
                  value="orphan"
                  required
                  checked={customerSource === 'orphan'}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">孤儿保单（公司分配）</p>
                  <p className="text-sm text-gray-500">由公司分配的存量客户</p>
                </div>
              </label>

              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                customerSource === 'referral'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="source"
                  value="referral"
                  checked={customerSource === 'referral'}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">客户推荐</p>
                  <p className="text-sm text-gray-500">由现有客户推荐的新客户</p>
                </div>
              </label>

              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                customerSource === 'self'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="source"
                  value="self"
                  checked={customerSource === 'self'}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">自主开发</p>
                  <p className="text-sm text-gray-500">自主开发的新客户</p>
                </div>
              </label>
            </div>

            {/* 推荐人选择器 */}
            {customerSource === 'referral' && (
              <div className="mt-4 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <Label className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  搜索推荐人 <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="输入姓名或手机号搜索..."
                      value={searchTerm}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setSearchTerm(newValue);
                        if (selectedReferrer && newValue !== searchTerm) {
                          setSelectedReferrer('');
                        }
                      }}
                    />
                  </div>
                  {selectedReferrer && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedReferrer('');
                        setSearchTerm('');
                      }}
                    >
                      清除
                    </Button>
                  )}
                </div>

                {/* 搜索结果 */}
                {searchTerm && !selectedReferrer && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        未找到匹配的客户
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedReferrer(c.id.toString());
                            setSearchTerm(`${formatCustomerId(c.id)} ${c.name}`);
                          }}
                          className={`cursor-pointer border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-blue-50 ${
                            selectedReferrer === c.id.toString() ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {formatCustomerId(c.id)} {c.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {c.phone || '无手机号'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedReferrer && (
                  <div className="mt-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                    ✓ 已选择推荐人
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
          </CardContent>
        </Card>

        {/* 其他信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              其他信息
            </CardTitle>
            <CardDescription>可选信息，可稍后补充</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                地址
              </Label>
              <Textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={customer.address || ''}
                placeholder="请输入地址"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_info">家庭情况</Label>
              <Textarea
                id="family_info"
                name="family_info"
                rows={2}
                defaultValue={customer.family_info || ''}
                placeholder="例如：已婚，有一子"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={customer.notes || ''}
                placeholder="其他备注信息..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
          <Link href={`/customers/${id}`}>
            <Button type="button" variant="outline" size="lg">
              取消
            </Button>
          </Link>
          <Button type="submit" size="lg" disabled={saving} className="min-w-[120px]">
            {saving ? '保存中...' : '保存更改'}
          </Button>
        </div>
      </form>
    </div>
  );
}
