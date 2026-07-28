import { NextRequest, NextResponse } from 'next/server';
import type { BatchData } from '@/lib/types';

// In-memory store for batch data
const batchStore = new Map<string, BatchData>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batch: BatchData = {
      id: body.id,
      createdAt: body.createdAt,
      records: body.records,
      fileName: body.fileName,
    };

    batchStore.set(batch.id, batch);

    return NextResponse.json({
      success: true,
      batchId: batch.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: '存储失败' },
      { status: 500 }
    );
  }
}

export { batchStore };
