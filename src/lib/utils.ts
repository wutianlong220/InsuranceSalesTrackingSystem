/**
 * 格式化客户ID为三位数，例如：#001, #123
 */
export function formatCustomerId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

/**
 * 根据生日计算年龄
 */
export function calculateAge(birthday: string | null): number {
  if (!birthday) return 0;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * 获取客户状态对应的颜色样式
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case '刚成交':
      return 'bg-blue-100 text-blue-800';
    case '跟踪中':
      return 'bg-yellow-100 text-yellow-800';
    case '已见面':
      return 'bg-green-100 text-green-800';
    case '已约平台':
      return 'bg-purple-100 text-purple-800';
    case '新客户':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 获取互动类型对应的颜色样式
 */
export function getInteractionTypeColor(type: string): string {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-800';
    case 'wechat':
      return 'bg-green-100 text-green-800';
    case 'meet':
      return 'bg-yellow-100 text-yellow-800';
    case 'platform':
      return 'bg-purple-100 text-purple-800';
    case 'deal':
      return 'bg-red-100 text-red-800';
    case 'referral':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
