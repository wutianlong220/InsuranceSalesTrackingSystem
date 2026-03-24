'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCustomerId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Phone, Cake, Briefcase, MapPin, FileText, Search } from 'lucide-react';

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
        const errorData = await res.json().catch(() => ({ error: '创建失败' }));
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
    <div className="container max-w-4xl space-y-6 px-6 py-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">添加新客户</h1>
          <p className="text-sm text-gray-500">填写客户基本信息</p>
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
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setSelectedReferrer(customer.id.toString());
                            setSearchTerm(`${formatCustomerId(customer.id)} ${customer.name}`);
                          }}
                          className={`cursor-pointer border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-blue-50 ${
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
                placeholder="请输入地址"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_info">家庭情况</Label>
              <Textarea
                id="family_info"
                name="family_info"
                rows={2}
                placeholder="例如：已婚，有一子"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="其他备注信息..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
          <Link href="/">
            <Button type="button" variant="outline" size="lg">
              取消
            </Button>
          </Link>
          <Button type="submit" size="lg" disabled={loading} className="min-w-[120px]">
            {loading ? '保存中...' : '保存客户'}
          </Button>
        </div>
      </form>
    </div>
  );
}
