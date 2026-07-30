import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 从 Supabase 查询
    const { data, error } = await supabase
      .from('repayment_batches')
      .select('data')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '数据未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}
