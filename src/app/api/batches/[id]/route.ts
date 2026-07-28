import { NextRequest, NextResponse } from 'next/server';
import { batchStore } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = batchStore.get(id);

    if (!batch) {
      return NextResponse.json(
        { error: '数据未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}
