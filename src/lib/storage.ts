import type { BatchData } from './types';

const STORAGE_PREFIX = 'repayment_batch_';

export function saveBatch(batch: BatchData): void {
  const key = STORAGE_PREFIX + batch.id;
  localStorage.setItem(key, JSON.stringify(batch));
}

export function loadBatch(batchId: string): BatchData | null {
  const key = STORAGE_PREFIX + batchId;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BatchData;
  } catch {
    return null;
  }
}

export function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
