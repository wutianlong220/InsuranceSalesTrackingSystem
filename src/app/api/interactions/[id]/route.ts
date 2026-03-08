import { NextRequest, NextResponse } from 'next/server';
import { getInteractionById, updateInteraction, deleteInteraction } from '@/lib/interactions';
import { UpdateInteractionInput } from '@/types/interaction';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const interaction = await getInteractionById(parseInt(id));

    if (!interaction) {
      return NextResponse.json({ error: 'Interaction not found' }, { status: 404 });
    }

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error fetching interaction:', error);
    return NextResponse.json({ error: 'Failed to fetch interaction' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateInteractionInput = await request.json();
    const interaction = await updateInteraction(parseInt(id), body);
    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error updating interaction:', error);
    return NextResponse.json({ error: 'Failed to update interaction' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteInteraction(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    return NextResponse.json({ error: 'Failed to delete interaction' }, { status: 500 });
  }
}
