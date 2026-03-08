import { query } from './db';
import { Interaction, CreateInteractionInput, UpdateInteractionInput } from '@/types/interaction';

export async function getInteractionsByCustomerId(customerId: number): Promise<Interaction[]> {
  const result = await query(
    `SELECT id, customer_id, type, to_char(date, 'YYYY-MM-DD') as date, content, next_step, referral_id, created_at
     FROM interactions
     WHERE customer_id = $1
     ORDER BY date DESC, created_at DESC`,
    [customerId]
  );

  return result.rows;
}

export async function getInteractionById(id: number): Promise<Interaction | null> {
  const result = await query(
    `SELECT id, customer_id, type, to_char(date, 'YYYY-MM-DD') as date, content, next_step, referral_id, created_at
     FROM interactions
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createInteraction(data: CreateInteractionInput): Promise<Interaction> {
  const { customer_id, type, date, content, next_step, referral_id } = data;

  const result = await query(
    `INSERT INTO interactions (customer_id, type, date, content, next_step, referral_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [customer_id, type, date, content, next_step || null, referral_id || null]
  );

  return result.rows[0];
}

export async function updateInteraction(id: number, data: UpdateInteractionInput): Promise<Interaction> {
  const { type, date, content, next_step, referral_id } = data;

  const result = await query(
    `UPDATE interactions
     SET type = $1, date = $2, content = $3, next_step = $4, referral_id = $5
     WHERE id = $6
     RETURNING *`,
    [type, date, content, next_step || null, referral_id || null, id]
  );

  return result.rows[0];
}

export async function deleteInteraction(id: number): Promise<void> {
  await query('DELETE FROM interactions WHERE id = $1', [id]);
}
