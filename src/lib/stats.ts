import { query } from './db';

export interface MonthlyStats {
  visits: number;
  calls: number;
  deals: number;
  new_customers: number;
}

export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM interactions WHERE type = 'meet' AND date >= $1 AND date < $2) as visits,
       (SELECT COUNT(*) FROM interactions WHERE type = 'call' AND date >= $1 AND date < $2) as calls,
       (SELECT COUNT(*) FROM interactions WHERE type = 'deal' AND date >= $1 AND date < $2) as deals,
       (SELECT COUNT(*) FROM customers WHERE created_at >= $1 AND created_at < $2) as new_customers`,
    [startDate, endDate]
  );

  const row = result.rows[0];
  return {
    visits: parseInt(row.visits) || 0,
    calls: parseInt(row.calls) || 0,
    deals: parseInt(row.deals) || 0,
    new_customers: parseInt(row.new_customers) || 0,
  };
}

export async function getCurrentMonthStats(): Promise<MonthlyStats> {
  const now = new Date();
  return getMonthlyStats(now.getFullYear(), now.getMonth() + 1);
}
