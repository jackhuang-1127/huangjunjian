import type { BatchData } from './types';
import LZString from 'lz-string';

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

export function encodeDataToUrl(batch: BatchData): string {
  const json = JSON.stringify(batch);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

export function decodeDataFromUrl(encoded: string): BatchData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as BatchData;
  } catch {
    return null;
  }
}
