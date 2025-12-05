import { NextResponse } from 'next/server';
import { APIResponse } from '@/types';

const API_BASE_URL = 'https://floodsupport.org/api/sos';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '200', 10);

  try {
    const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`, {
      next: { revalidate: 0 }, // Don't cache
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: APIResponse = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        records: data.data,
        stats: data.stats,
        pagination: data.pagination,
        fetchedAt: new Date().toISOString(),
      });
    } else {
      throw new Error('API returned success=false');
    }
  } catch (error) {
    console.error('Error fetching SOS chunk:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
