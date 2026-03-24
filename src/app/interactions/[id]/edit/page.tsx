'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Interaction } from '@/types/interaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, MessageSquare, Users, Calendar, FileText, CheckCircle } from 'lucide-react';

const INTERACTION_TYPES = [
  { value: 'call', label: '电话', icon: Phone, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'wechat', label: '微信', icon: MessageSquare, color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'meet', label: '见面', icon: Users, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'platform', label: '约平台', icon: Calendar, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'deal', label: '成交', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200' },
];

export default function EditInteractionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interactionType, setInteractionType] = useState<string>('call');

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      fetchInteraction(p.id);
    });
  }, []);

  async function fetchInteraction(interactionId: string) {
    try {
      const res = await fetch(`/api/interactions/${interactionId}`);
      const data = await res.json();
      setInteraction(data);
      setCustomerId(data.customer_id.toString());
      setInteractionType(data.type);
      fetchCustomerName(data.customer_id);
    } catch (error) {
      console.error('Failed to fetch interaction:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomerName(customerId: number) {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      setCustomerName(data.name);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get('type'),
      date: formData.get('date'),
      content: formData.get('content'),
      next_step: formData.get('next_step'),
    };

    try {
      const res = await fetch(`/api/interactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/customers/${customerId}`);
      } else {
        alert('更新失败');
      }
    } catch (error) {
      console.error('Failed to update interaction:', error);
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

  if (!interaction) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium text-gray-900">记录不存在</p>
            <p className="mt-2 text-sm text-gray-500">未找到该互动记录</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedTypeConfig = INTERACTION_TYPES.find(t => t.value === interactionType);

  return (
    <div className="container max-w-3xl space-y-6 px-6 py-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Link href={`/customers/${customerId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回详情
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">编辑互动记录</h1>
          <p className="text-sm text-gray-500">
            修改 <span className="font-medium text-blue-600">{customerName}</span> 的互动信息
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 互动类型选择 */}
        <Card>
          <CardHeader>
            <CardTitle>互动类型</CardTitle>
            <CardDescription>选择本次互动的类型</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5">
              {INTERACTION_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = interactionType === type.value;
                return (
                  <label
                    key={type.value}
                    className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={isSelected}
                      onChange={(e) => setInteractionType(e.target.value)}
                      required
                      className="sr-only"
                    />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 日期和内容 */}
        <Card>
          <CardHeader>
            <CardTitle>记录详情</CardTitle>
            <CardDescription>修改互动的具体信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  互动日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={interaction.date}
                />
              </div>

              <div className="space-y-2">
                <Label>当前选择</Label>
                <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3">
                  {selectedTypeConfig && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={selectedTypeConfig.color}>
                        {selectedTypeConfig.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {interactionType === 'deal' ? '记录成交信息' : '记录互动内容'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                内容记录 <span className="text-red-500">*</span>
              </Label>
              {interactionType === 'deal' && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                  💡 成交记录：请记录产品名称、金额、缴费方式等信息
                </p>
              )}
              {interactionType !== 'deal' && (
                <p className="text-sm text-gray-500">
                  记录本次互动的详细内容，如：聊了什么产品、客户反馈等
                </p>
              )}
              <Textarea
                id="content"
                name="content"
                required
                rows={4}
                defaultValue={interaction.content}
                placeholder="例如：今天去拜访，送了茶叶，客户对养老险感兴趣，考虑中"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_step">下一步计划</Label>
              <p className="text-sm text-gray-500">
                记录后续的跟进计划，方便下次查看
              </p>
              <Textarea
                id="next_step"
                name="next_step"
                rows={2}
                defaultValue={interaction.next_step || ''}
                placeholder="例如：下周再电话跟进，推荐养老险产品"
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
          <Link href={`/customers/${customerId}`}>
            <Button type="button" variant="outline" size="lg">
              取消
            </Button>
          </Link>
          <Button type="submit" size="lg" disabled={saving} className="min-w-[120px]">
            {saving ? '保存中...' : '保存修改'}
          </Button>
        </div>
      </form>
    </div>
  );
}
