/**
 * 使用客户列表的自定义 Hook
 */
import { useState, useEffect } from 'react';
import { CustomerWithStats } from '@/types/customer';
import { handleError } from '@/lib/errorHandler';

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/customers');
        if (!res.ok) {
          throw new Error('获取客户列表失败');
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          throw new Error('数据格式错误');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取客户列表失败';
        setError(errorMessage);
        handleError(err, { fallbackMessage: errorMessage, showAlert: false });
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/customers');
      if (!res.ok) {
        throw new Error('获取客户列表失败');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取客户列表失败';
      setError(errorMessage);
      handleError(err, { fallbackMessage: errorMessage, showAlert: false });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  return { customers, loading, error, refetch };
}
