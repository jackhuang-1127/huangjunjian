'use client';

import { useState, useRef, useCallback } from 'react';
import { parseExcelFile } from '@/lib/excel-parser';
import { generateBatchId } from '@/lib/storage';
import { saveBatchToSupabase } from '@/lib/supabase-client';
import type { BatchData, ParseResult } from '@/lib/types';
import QRCode from 'qrcode';

export default function AdminPage() {
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQR = useCallback(async (batchId: string) => {
    const domain = process.env.NEXT_PUBLIC_DOMAIN || window.location.origin;
    const queryUrl = `${domain}/query/${batchId}`;
    try {
      const url = await QRCode.toDataURL(queryUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch {
      setError('二维码生成失败');
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setError('请上传 .xlsx 或 .xls 格式的Excel文件');
        return;
      }

      setIsUploading(true);
      setError('');
      setQrDataUrl('');
      setBatch(null);
      setParseResult(null);

      try {
        const result = await parseExcelFile(file);

        if (result.records.length === 0) {
          setError('未解析到有效数据，请检查Excel文件格式');
          setIsUploading(false);
          return;
        }

        const batchId = generateBatchId();
        const batchData: BatchData = {
          id: batchId,
          createdAt: Date.now(),
          records: result.records,
          fileName: file.name,
          accountName: result.accountName,
          accountNumber: result.accountNumber,
          bankName: result.bankName,
        };

        // 保存到 Supabase
        const result = await saveBatchToSupabase(batchData);
        if (!result.success) {
          setError('数据上传失败：' + (result.error || '未知错误'));
          setIsUploading(false);
          return;
        }

        setBatch(batchData);
        setParseResult(result);
        await generateQR(batchId);
      } catch (err) {
        setError(err instanceof Error ? err.message : '文件解析失败');
      } finally {
        setIsUploading(false);
      }
    },
    [generateQR]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleReset = () => {
    setBatch(null);
    setParseResult(null);
    setQrDataUrl('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">还款计划管理</h1>
            <p className="text-xs text-slate-500">上传Excel文件，生成查询二维码</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Upload Area */}
        {!batch && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200
              ${dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-800 rounded-full animate-spin" />
                <p className="text-sm text-slate-600">正在解析并上传...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-slate-700">
                    点击或拖拽上传Excel文件
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    支持 .xlsx / .xls 格式
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {batch && parseResult && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">解析结果</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  解析成功
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <p className="text-2xl font-bold text-blue-800">{parseResult.records.length}</p>
                  <p className="text-xs text-slate-500 mt-1">还款记录</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <p className="text-2xl font-bold text-blue-800">{parseResult.uniqueCompanies.size}</p>
                  <p className="text-xs text-slate-500 mt-1">涉及企业</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <p className="text-2xl font-bold text-blue-800">
                    {parseResult.records.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">合计金额(元)</p>
                </div>
              </div>

              {parseResult.errors.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-1">
                    解析提示（{parseResult.errors.length}条）
                  </p>
                  <div className="max-h-20 overflow-y-auto">
                    {parseResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-amber-600">{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Card */}
            {qrDataUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                <h2 className="text-base font-bold text-slate-900 mb-2">客户扫码查询</h2>
                <p className="text-sm text-slate-500 mb-4">
                  将下方二维码发送给客户，客户扫码即可查询还款计划
                </p>
                <div className="inline-block p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="查询二维码" width={280} height={280} />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 font-medium">{batch.fileName}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    上传时间：{new Date(batch.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  二维码链接：/query/{batch.id}
                </p>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              重新上传
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
