/**
 * 统一的错误处理工具
 */

export interface ErrorHandlerOptions {
  fallbackMessage?: string;
  logToConsole?: boolean;
  showAlert?: boolean;
}

/**
 * 处理API错误
 * @param error 错误对象
 * @param options 配置选项
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    fallbackMessage = '操作失败，请稍后重试',
    logToConsole = true,
    showAlert = true,
  } = options;

  // 记录到控制台
  if (logToConsole) {
    console.error('Error:', error);
  }

  // 显示用户友好的错误消息
  if (showAlert) {
    const message = getErrorMessage(error, fallbackMessage);
    alert(message);
  }
}

/**
 * 从错误对象中提取用户友好的错误消息
 */
function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return fallbackMessage;
}

/**
 * 处理API响应错误
 */
export async function handleApiResponse<T>(
  response: Response,
  fallbackMessage: string = '请求失败'
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || fallbackMessage);
  }
  return response.json();
}

/**
 * 显示成功消息
 */
export function showSuccess(message: string): void {
  // 简单实现，可以后续替换为 toast 通知
  alert(message);
}

/**
 * 显示确认对话框
 */
export function showConfirm(message: string): boolean {
  return confirm(message);
}
