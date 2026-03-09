import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer, deleteCustomer, getCustomerWithStats, getCustomerWithReferrer } from '@/lib/customers';
import { UpdateCustomerSchema } from '@/schemas/customer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await getCustomerWithReferrer(parseInt(id));

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 验证输入数据
    const validatedData = UpdateCustomerSchema.parse(body);

    const customer = await updateCustomer(parseInt(id), validatedData);
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);

    // 处理 Zod 验证错误 - 返回友好的错误消息
    if (error instanceof Error && error.name === 'ZodError') {
      try {
        const zodError = JSON.parse(error.message);
        const firstError = zodError[0];

        // 返回第一个错误作为主要错误信息
        const mainError = firstError ? `${getFieldNameCN(firstError.path[0])}${firstError.message}` : '输入数据验证失败';

        return NextResponse.json(
          { error: mainError },
          { status: 400 }
        );
      } catch {
        // 如果解析 Zod 错误失败，返回通用错误
        return NextResponse.json(
          { error: '输入数据格式不正确' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// 字段名中英文映射
function getFieldNameCN(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: '姓名',
    gender: '性别',
    phone: '手机号',
    address: '地址',
    birthday: '生日',
    occupation: '职业',
    family_info: '家庭情况',
    source: '客户来源',
    was_referred_by: '推荐人',
    notes: '备注',
  };
  return fieldMap[fieldName] || fieldName;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCustomer(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
