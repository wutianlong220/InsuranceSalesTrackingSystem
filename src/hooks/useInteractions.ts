/**
 * 使用互动记录的自定义 Hook
 */
import { useState, useEffect } from 'react';
import { Interaction } from '@/types/interaction';
import { handleError } from '@/lib/errorHandler';

export function useInteractions(customerId: string) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInteractions() {
      if (!customerId) {
        setInteractions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/customers/${customerId}/interactions`);
        if (!res.ok) {
          throw new Error('获取互动记录失败');
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setInteractions(data);
        } else {
          throw new Error('数据格式错误');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取互动记录失败';
        setError(errorMessage);
        handleError(err, { fallbackMessage: errorMessage, showAlert: false });
        setInteractions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInteractions();
  }, [customerId]);

  const refetch = async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/customers/${customerId}/interactions`);
      if (!res.ok) {
        throw new Error('获取互动记录失败');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setInteractions(data);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取互动记录失败';
      setError(errorMessage);
      handleError(err, { fallbackMessage: errorMessage, showAlert: false });
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  return { interactions, loading, error, refetch };
}
