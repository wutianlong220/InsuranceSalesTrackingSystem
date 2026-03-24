import { z } from 'zod';

/**
 * 客户创建验证 schema
 */
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过100个字符'),
  gender: z.enum(['male', 'female']).nullable().optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').nullable().optional(),
  address: z.string().max(500, '地址不能超过500个字符').nullable().optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式不正确，应为YYYY-MM-DD').nullable().optional(),
  occupation: z.string().max(100, '职业不能超过100个字符').nullable().optional(),
  family_info: z.string().max(500, '家庭情况不能超过500个字符').nullable().optional(),
  source: z.enum(['orphan', 'referral', 'self']),
  was_referred_by: z.number().int().positive().nullable().optional(),
  notes: z.string().max(1000, '备注不能超过1000个字符').nullable().optional(),
});

/**
 * 客户更新验证 schema（所有字段可选）
 */
export const UpdateCustomerSchema = CreateCustomerSchema.partial();

/**
 * 客户ID验证 schema
 */
export const CustomerIdSchema = z.object({
  id: z.string().regex(/^\d+$/, '客户ID必须是数字').transform(Number),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
