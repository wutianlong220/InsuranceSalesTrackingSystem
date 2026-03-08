import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomersWithStats, searchCustomers, filterCustomersByStatus, createCustomer } from '@/lib/customers';
import { CreateCustomerInput } from '@/types/customer';

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
    const body: CreateCustomerInput = await request.json();
    const customer = await createCustomer(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
