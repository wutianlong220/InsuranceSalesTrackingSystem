import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
  command: string;
  fields: any[];
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', error);
    throw error;
  }
}

export default pool;
