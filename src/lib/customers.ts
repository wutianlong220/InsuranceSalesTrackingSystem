import { query } from './db';
import { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerWithStats } from '@/types/customer';
import { getStatusFromInteraction } from '@/constants/statusMapping';

// 统一格式化customer数据，确保日期字段始终是 YYYY-MM-DD 格式
function formatCustomerData(customer: any): Customer {
  // 处理 birthday 字段：可能是 Date 对象、字符串，或 null
  let formattedBirthday: string | null = null;
  if (customer.birthday) {
    // 先转换为字符串，处理 Date 对象和字符串两种情况
    const birthdayStr = customer.birthday instanceof Date
      ? customer.birthday.toISOString()
      : String(customer.birthday);
    // 提取日期部分（YYYY-MM-DD）
    formattedBirthday = birthdayStr.split('T')[0];
  }

  return {
    ...customer,
    birthday: formattedBirthday,
  };
}

export async function getAllCustomers(): Promise<Customer[]> {
  const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
  return result.rows.map(formatCustomerData);
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
  const customer = result.rows[0];
  return customer ? formatCustomerData(customer) : null;
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  const {
    name,
    gender,
    phone,
    address,
    birthday,
    occupation,
    family_info,
    source,
    was_referred_by,
    notes,
  } = data;

  const result = await query(
    `INSERT INTO customers (name, gender, phone, address, birthday, occupation, family_info, source, was_referred_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [name, gender || null, phone || null, address || null, birthday || null, occupation || null, family_info || null, source, was_referred_by || null, notes || null]
  );

  return formatCustomerData(result.rows[0]);
}

export async function updateCustomer(id: number, data: UpdateCustomerInput): Promise<Customer> {
  const {
    name,
    gender,
    phone,
    address,
    birthday,
    occupation,
    family_info,
    source,
    was_referred_by,
    notes,
  } = data;

  const result = await query(
    `UPDATE customers
     SET name = $1, gender = $2, phone = $3, address = $4, birthday = $5, occupation = $6,
         family_info = $7, source = $8, was_referred_by = $9, notes = $10, updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [name, gender || null, phone || null, address || null, birthday || null, occupation || null, family_info || null, source, was_referred_by || null, notes || null, id]
  );

  return formatCustomerData(result.rows[0]);
}

export async function deleteCustomer(id: number): Promise<void> {
  await query('DELETE FROM customers WHERE id = $1', [id]);
}

export async function searchCustomers(keyword: string): Promise<Customer[]> {
  const pattern = `%${keyword}%`;
  const result = await query(
    `SELECT * FROM customers WHERE name ILIKE $1 OR phone ILIKE $2 ORDER BY created_at DESC`,
    [pattern, pattern]
  );
  return result.rows.map(formatCustomerData);
}

export async function getCustomerWithStats(id: number): Promise<CustomerWithStats | null> {
  const result = await query(
    `SELECT
       c.*,
       (SELECT COUNT(*) FROM interactions WHERE customer_id = c.id AND type = 'deal') as deal_count,
       (SELECT type FROM interactions WHERE customer_id = c.id ORDER BY date DESC, created_at DESC LIMIT 1) as last_interaction_type,
       (SELECT to_char(date::date, 'YYYY-MM-DD') FROM interactions WHERE customer_id = c.id ORDER BY date DESC, created_at DESC LIMIT 1) as last_contact
     FROM customers c
     WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const customer = result.rows[0];
  const deal_count = parseInt(customer.deal_count) || 0;
  const status = getStatusFromInteraction(customer.last_interaction_type);

  return {
    ...formatCustomerData(customer),
    deal_count,
    status,
  };
}

export async function getAllCustomersWithStats(): Promise<CustomerWithStats[]> {
  const result = await query(
    `SELECT
       c.*,
       (SELECT COUNT(*) FROM interactions WHERE customer_id = c.id AND type = 'deal') as deal_count,
       (SELECT type FROM interactions WHERE customer_id = c.id ORDER BY date DESC, created_at DESC LIMIT 1) as last_interaction_type,
       (SELECT to_char(date::date, 'YYYY-MM-DD') FROM interactions WHERE customer_id = c.id ORDER BY date DESC, created_at DESC LIMIT 1) as last_contact
     FROM customers c
     ORDER BY c.created_at DESC`
  );

  return result.rows.map((customer: any) => {
    const deal_count = parseInt(customer.deal_count) || 0;
    const status = getStatusFromInteraction(customer.last_interaction_type);

    return {
      ...formatCustomerData(customer),
      deal_count,
      status,
    };
  });
}

export async function filterCustomersByStatus(status: string): Promise<CustomerWithStats[]> {
  const allCustomers = await getAllCustomersWithStats();
  return allCustomers.filter((c) => c.status === status);
}

export async function getCustomerWithReferrer(id: number): Promise<CustomerWithStats & { referrer?: Customer } | null> {
  const customer = await getCustomerWithStats(id);
  if (!customer) return null;

  let referrer: Customer | null = null;
  if (customer.was_referred_by) {
    referrer = await getCustomerById(customer.was_referred_by);
  }

  return {
    ...customer,
    referrer: referrer || undefined,
  };
}
