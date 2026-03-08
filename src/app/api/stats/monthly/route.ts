import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMonthStats, getMonthlyStats } from '@/lib/stats';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (year && month) {
      const stats = await getMonthlyStats(parseInt(year), parseInt(month));
      return NextResponse.json(stats);
    }

    const stats = await getCurrentMonthStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
