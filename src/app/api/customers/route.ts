import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomersWithStats, searchCustomers, filterCustomersByStatus, createCustomer } from '@/lib/customers';
import { CreateCustomerSchema } from '@/schemas/customer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    if (search) {
      const customers = await searchCustomers(search);
      return NextResponse.json(customers);
    }

    if (status) {
      const customers = await filterCustomersByStatus(status);
      return NextResponse.json(customers);
    }

    const customers = await getAllCustomersWithStats();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入数据
    const validatedData = CreateCustomerSchema.parse(body);

    const customer = await createCustomer(validatedData);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);

    // 处理 Zod 验证错误 - 返回友好的错误消息
    if (error instanceof Error && error.name === 'ZodError') {
      try {
        const zodError = JSON.parse(error.message);
        const firstError = zodError[0];
        const fieldErrors: Record<string, string> = {};

        zodError.forEach((err: any) => {
          if (err.path) {
            const fieldName = getFieldNameCN(err.path[0]);
            fieldErrors[fieldName] = err.message;
          }
        });

        // 返回第一个错误作为主要错误信息
        const mainError = firstError ? `${getFieldNameCN(firstError.path[0])}${firstError.message}` : '输入数据验证失败';

        return NextResponse.json(
          { error: mainError, fieldErrors },
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

    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
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
