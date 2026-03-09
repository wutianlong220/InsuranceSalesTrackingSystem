/**
 * 互动类型到客户状态的映射
 */

export const INTERACTION_TO_STATUS: Record<string, string> = {
  deal: '刚成交',
  call: '跟踪中',
  wechat: '跟踪中',
  referral: '跟踪中',
  meet: '已见面',
  platform: '已约平台',
  default: '新客户'
} as const;

/**
 * 根据最后的互动类型获取客户状态
 */
export function getStatusFromInteraction(interactionType: string | null): string {
  if (!interactionType) {
    return INTERACTION_TO_STATUS.default;
  }
  return INTERACTION_TO_STATUS[interactionType] || INTERACTION_TO_STATUS.default;
}
