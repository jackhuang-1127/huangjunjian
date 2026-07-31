import { createClient } from '@supabase/supabase-js';
import type { BatchData } from './types';

// Supabase 配置（直接硬编码，因为 Gitee Pages 不支持构建时环境变量）
const supabaseUrl = 'https://ljebrvptuzkyvbiubcyc.supabase.co';
const supabaseAnonKey = 'sb_publishable_Mvj6_yzjRcXpK49tgOkPDA_MAmc4h1f';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 存储批次数据到 Supabase
 */
export async function saveBatchToSupabase(data: BatchData): Promise<{ success: boolean; batchId?: string; error?: string }> {
  try {
    const { data: result, error } = await supabase
      .from('repayment_batches')
      .insert([
        {
          batch_id: data.batchId,
          file_name: data.fileName,
          account_name: data.accountName,
          account_number: data.accountNumber,
          bank_name: data.bankName,
          records: data.records,
          created_at: new Date(data.createdAt).toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, batchId: result.batch_id };
  } catch (err) {
    console.error('Save batch error:', err);
    return { success: false, error: '存储失败' };
  }
}

/**
 * 从 Supabase 获取批次数据
 */
export async function getBatchFromSupabase(batchId: string): Promise<BatchData | null> {
  try {
    const { data, error } = await supabase
      .from('repayment_batches')
      .select('*')
      .eq('batch_id', batchId)
      .single();

    if (error) {
      console.error('Supabase select error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // 转换数据格式
    return {
      batchId: data.batch_id,
      fileName: data.file_name,
      accountName: data.account_name,
      accountNumber: data.account_number,
      bankName: data.bank_name,
      records: data.records,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Get batch error:', err);
    return null;
  }
}
