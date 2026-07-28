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

export async function uploadBatchToServer(batch: BatchData): Promise<boolean> {
  try {
    const response = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

export async function fetchBatchFromServer(batchId: string): Promise<BatchData | null> {
  try {
    const response = await fetch(`/api/batches/${batchId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
