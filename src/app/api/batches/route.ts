import { NextRequest, NextResponse } from 'next/server';
import type { BatchData } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batch: BatchData = {
      id: body.id,
      createdAt: body.createdAt,
      records: body.records,
      fileName: body.fileName,
    };

    // 存储到 Supabase
    const { error } = await supabase
      .from('repayment_batches')
      .insert({
        id: batch.id,
        file_name: batch.fileName,
        data: batch,
        created_at: batch.createdAt,
      });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: '存储失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      batchId: batch.id,
    });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: '存储失败' },
      { status: 500 }
    );
  }
}
