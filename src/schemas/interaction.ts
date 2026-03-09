import { z } from 'zod';

/**
 * 互动记录创建验证 schema
 */
export const CreateInteractionSchema = z.object({
  customer_id: z.number().int().positive('客户ID必须是正整数'),
  type: z.enum(['call', 'wechat', 'meet', 'platform', 'deal', 'referral'], {
    errorMap: () => ({ message: '互动类型必须是电话、微信、见面、约平台、成交或推荐' })
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确，应为YYYY-MM-DD'),
  content: z.string().min(1, '互动内容不能为空').max(2000, '互动内容不能超过2000个字符'),
  next_step: z.string().max(500, '下一步计划不能超过500个字符').nullable().optional(),
  referral_id: z.number().int().positive().nullable().optional(),
});

/**
 * 互动记录更新验证 schema（所有字段可选）
 */
export const UpdateInteractionSchema = CreateInteractionSchema.partial();

/**
 * 互动记录ID验证 schema
 */
export const InteractionIdSchema = z.object({
  id: z.string().regex(/^\d+$/, '互动记录ID必须是数字').transform(Number),
});

export type CreateInteractionInput = z.infer<typeof CreateInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof UpdateInteractionSchema>;
