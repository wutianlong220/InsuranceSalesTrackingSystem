/**
 * 使用客户数据的自定义 Hook
 */
import { useState, useEffect } from 'react';
import { CustomerWithStats } from '@/types/customer';
import { handleError } from '@/lib/errorHandler';

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) {
          throw new Error('获取客户信息失败');
        }
        const data = await res.json();
        setCustomer(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取客户信息失败';
        setError(errorMessage);
        handleError(err, { fallbackMessage: errorMessage, showAlert: false });
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [id]);

  return { customer, loading, error };
}
