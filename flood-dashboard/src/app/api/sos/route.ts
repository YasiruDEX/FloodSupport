import { NextResponse } from 'next/server';
import { APIResponse, SOSRecord } from '@/types';

const API_BASE_URL = 'https://floodsupport.org/api/sos';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allRecords: SOSRecord[] = [];
    let page = 1;
    let totalPages = 1;
    let stats = null;

    // Fetch all pages
    while (page <= totalPages) {
      const response = await fetch(`${API_BASE_URL}?page=${page}&limit=100`, {
        next: { revalidate: 0 }, // Don't cache
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.success) {
        allRecords.push(...data.data);
        totalPages = data.pagination.totalPages;

        if (page === 1) {
          stats = data.stats;
        }
      } else {
        throw new Error('API returned success=false');
      }

      page++;
    }

    return NextResponse.json({
      success: true,
      records: allRecords,
      stats,
      totalRecords: allRecords.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching SOS data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
