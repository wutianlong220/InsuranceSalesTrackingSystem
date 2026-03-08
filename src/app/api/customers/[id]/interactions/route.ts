import { NextRequest, NextResponse } from 'next/server';
import { getInteractionsByCustomerId } from '@/lib/interactions';
import { createInteraction } from '@/lib/interactions';
import { CreateInteractionInput } from '@/types/interaction';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const interactions = await getInteractionsByCustomerId(parseInt(id));
    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: CreateInteractionInput = await request.json();
    const interaction = await createInteraction({
      ...body,
      customer_id: parseInt(id),
    });
    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 });
  }
}
