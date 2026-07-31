'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchBatchFromServer } from '@/lib/storage';
import type { BatchData, RepaymentRecord } from '@/lib/types';

export default function QueryPage() {
  const params = useParams();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [searchName, setSearchName] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBatchFromServer(batchId).then((data) => {
      if (data) {
        setBatch(data);
        setFileName(data.fileName || '');
        setCreatedAt(data.createdAt ? new Date(data.createdAt).toLocaleString('zh-CN') : '');
      }
      setIsLoading(false);
    });
  }, [batchId]);

  const matchedRecords = useMemo(() => {
    if (!batch || !searchName.trim()) return [];
    const keyword = searchName.trim().toLowerCase();

    // 仅支持借款人查询
    return batch.records.filter((record: RepaymentRecord) => {
      return record.borrowerName.toLowerCase().includes(keyword);
    });
  }, [batch, searchName]);

  const summary = useMemo(() => {
    if (matchedRecords.length === 0) return { totalPrincipal: 0, totalInterest: 0, totalAmount: 0 };
    return {
      totalPrincipal: matchedRecords.reduce((sum: number, r: RepaymentRecord) => sum + r.principal, 0),
      totalInterest: matchedRecords.reduce((sum: number, r: RepaymentRecord) => sum + r.interest, 0),
      totalAmount: matchedRecords.reduce((sum: number, r: RepaymentRecord) => sum + r.totalAmount, 0),
    };
  }, [matchedRecords]);

  const handleSearch = () => {
    if (!searchName.trim()) return;
    setHasSearched(true);
    setNotFound(matchedRecords.length === 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const formatMoney = (value: number) => {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-800 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">数据未找到</h2>
          <p className="text-sm text-slate-500">
            该查询链接已失效或数据不存在，请联系管理员重新上传。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-900">还款计划查询</h1>
          <span className="text-xs text-slate-400">共 {batch.records.length} 条记录</span>
        </div>
      </div>

      {/* File Info */}
      {(fileName || createdAt) && (
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            {fileName && (
              <div className="flex items-center gap-2 text-slate-700">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">{fileName}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            输入借款人姓名查询
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setHasSearched(false);
                setNotFound(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="请输入借款人姓名"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors"
            >
              查询
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          {notFound ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600">未找到该借款人的还款记录</p>
              <p className="text-xs text-slate-400 mt-1">请检查姓名是否正确</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-medium text-slate-700 mb-3">还款汇总</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">本金合计</p>
                    <p className="text-sm font-bold text-slate-900">¥{formatMoney(summary.totalPrincipal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">利息合计</p>
                    <p className="text-sm font-bold text-slate-900">¥{formatMoney(summary.totalInterest)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">总计</p>
                    <p className="text-base font-bold text-[#dc2626]">¥{formatMoney(summary.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Records */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-medium text-slate-700">
                    还款明细（共 {matchedRecords.length} 期）
                  </h3>
                </div>
                <div className="space-y-3">
                  {matchedRecords.map((record, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-slate-600">{record.repaymentDate}</span>
                        <span className="text-lg font-bold text-[#dc2626]">¥{formatMoney(record.totalAmount)}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>本金：{formatMoney(record.principal)}  利息：{formatMoney(record.interest)}</p>
                        <p>还款账号：{record.repaymentAccount}</p>
                        {record.insuredNames && <p>被保险人：{record.insuredNames}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Info */}
              <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-900 mb-2">还款账户信息</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="text-blue-600">户名：</span>{batch.accountName || '-'}</p>
                  <p><span className="text-blue-600">账号：</span>{batch.accountNumber || '-'}</p>
                  <p><span className="text-blue-600">开户行：</span>{batch.bankName || '-'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
