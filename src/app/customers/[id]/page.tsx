'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerWithStats } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import { formatCustomerId, calculateAge } from '@/lib/utils';
import { handleError, showConfirm } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Cake, Briefcase, Users, FileText, Plus, Calendar, MessageSquare } from 'lucide-react';

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

  function getInteractionTypeIcon(type: string) {
    const icons = {
      call: Phone,
      wechat: MessageSquare,
      meet: Users,
      platform: Calendar,
      deal: FileText,
    };
    return icons[type as keyof typeof icons] || FileText;
  }

  function getInteractionTypeVariant(type: string): "default" | "success" | "warning" | "destructive" | "outline" | "secondary" {
    switch (type) {
      case 'deal': return 'success';
      case 'meet': return 'default';
      case 'call': return 'secondary';
      case 'wechat': return 'secondary';
      case 'platform': return 'warning';
      default: return 'secondary';
    }
  }

  function formatDate(date: string | null): string {
    if (!date) return '-';
    return date.split('T')[0];
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

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | null | undefined }) => (
    <div className="flex items-start gap-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="container space-y-6 px-6 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">{formatCustomerId(customer.id)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/customers/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              编辑
            </Button>
          </Link>
          <Button variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧信息卡片 */}
        <div className="space-y-6 lg:col-span-1">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-bold text-white">
                  {customer.name.charAt(0)}
                </div>
              </div>
              <InfoItem icon={Users} label="性别" value={customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : '-'} />
              <InfoItem icon={Cake} label="生日" value={formatDate(customer.birthday)} />
              <InfoItem icon={Briefcase} label="年龄" value={customer.birthday ? `${calculateAge(customer.birthday)}岁` : '-'} />
              <InfoItem icon={Phone} label="手机号" value={customer.phone} />
              <InfoItem icon={Briefcase} label="职业" value={customer.occupation} />
              <InfoItem icon={MapPin} label="地址" value={customer.address} />
            </CardContent>
          </Card>

          {/* 客户来源 */}
          <Card>
            <CardHeader>
              <CardTitle>客户来源</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">来源类型</span>
                  <Badge variant="outline">
                    {customer.source === 'orphan' ? '孤儿保单' : customer.source === 'referral' ? '客户推荐' : '自主开发'}
                  </Badge>
                </div>
                {customer.referrer && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">推荐人</span>
                    <Link
                      href={`/customers/${customer.referrer.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {formatCustomerId(customer.referrer.id)} {customer.referrer.name}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 家庭情况 */}
          {(customer.family_info || customer.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>其他信息</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.family_info && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium text-gray-500">家庭情况</p>
                    <p className="text-sm text-gray-900">{customer.family_info}</p>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500">备注</p>
                    <p className="text-sm text-gray-900">{customer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 成交统计 */}
          <Card>
            <CardHeader>
              <CardTitle>成交记录</CardTitle>
              <CardDescription>客户成交情况统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{customer.deal_count}</p>
                  <p className="text-sm text-gray-500">成交次数</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant={customer.status === '刚成交' ? 'success' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧互动记录 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>互动记录</CardTitle>
                  <CardDescription>与客户的所有互动历史</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="all">全部类型</option>
                    <option value="deal">成交</option>
                    <option value="meet">见面</option>
                    <option value="call">电话</option>
                    <option value="wechat">微信</option>
                    <option value="platform">约平台</option>
                  </select>
                  <Link href={`/customers/${id}/interactions/new`}>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      添加记录
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactions
                  .filter((interaction) => filterType === 'all' || interaction.type === filterType)
                  .map((interaction) => {
                    const Icon = getInteractionTypeIcon(interaction.type);
                    return (
                      <div
                        key={interaction.id}
                        className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <Badge variant={getInteractionTypeVariant(interaction.type)}>
                                  {getInteractionTypeLabel(interaction.type)}
                                </Badge>
                                <span className="text-xs text-gray-500">{interaction.date}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{interaction.content}</p>
                              {interaction.next_step && (
                                <div className="mt-2 rounded-md bg-blue-50 p-3">
                                  <p className="text-xs font-medium text-blue-900">下一步计划</p>
                                  <p className="mt-1 text-sm text-blue-700">{interaction.next_step}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Link href={`/interactions/${interaction.id}/edit`}>
                              <Button size="sm" variant="ghost" className="gap-1">
                                <Edit className="h-3 w-3" />
                                编辑
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteInteraction(interaction.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {interactions.length === 0 && (
                <div className="py-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm font-medium text-gray-900">暂无互动记录</p>
                  <p className="mt-1 text-sm text-gray-500">开始记录与客户的互动</p>
                  <Link href={`/customers/${id}/interactions/new`} className="mt-4 inline-block">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      添加第一条记录
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
