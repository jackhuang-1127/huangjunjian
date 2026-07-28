'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { loadBatch } from '@/lib/storage';
import type { BatchData, RepaymentRecord } from '@/lib/types';

export default function QueryPage() {
  const params = useParams();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [searchName, setSearchName] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = loadBatch(batchId);
    setBatch(data);
    setIsLoading(false);
  }, [batchId]);

  const matchedRecords = useMemo(() => {
    if (!batch || !searchName.trim()) return [];
    const keyword = searchName.trim().toLowerCase();

    return batch.records.filter((record: RepaymentRecord) => {
      if (record.borrowerName.toLowerCase().includes(keyword)) return true;
      const insuredList = record.insuredNames.split(/[,，]/);
      return insuredList.some((name: string) => name.trim().toLowerCase().includes(keyword));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-800 rounded-full animate-spin" />
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
      <header className="bg-blue-800 text-white">
        <div className="max-w-lg mx-auto px-4 py-5">
          <h1 className="text-lg font-bold">还款计划查询</h1>
          <p className="text-blue-200 text-xs mt-1">请输入企业名称查询您的还款计划</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            企业名称
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入借款人或被保险企业名称"
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <button
              onClick={handleSearch}
              disabled={!searchName.trim()}
              className="px-5 py-2.5 rounded-lg bg-blue-800 text-white text-sm font-medium hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              查询
            </button>
          </div>
        </div>

        {/* Results */}
        {hasSearched && !notFound && matchedRecords.length > 0 && (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                共找到 <span className="font-bold">{matchedRecords.length}</span> 条还款记录
              </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">应还日期</th>
                      <th className="text-right px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">应还本金</th>
                      <th className="text-right px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">应还利息</th>
                      <th className="text-right px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">合计应还</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedRecords.map((record: RepaymentRecord, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{record.repaymentDate}</td>
                        <td className="px-3 py-3 text-right text-slate-900 whitespace-nowrap font-medium tabular-nums">
                          {formatMoney(record.principal)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-900 whitespace-nowrap font-medium tabular-nums">
                          {formatMoney(record.interest)}
                        </td>
                        <td className="px-3 py-3 text-right text-red-600 whitespace-nowrap font-bold tabular-nums">
                          {formatMoney(record.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="border-t-2 border-blue-800 bg-slate-50 px-3 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">合计</span>
                  <div className="text-right">
                    <div className="flex gap-4 text-xs text-slate-500 mb-1">
                      <span>本金: {formatMoney(summary.totalPrincipal)}</span>
                      <span>利息: {formatMoney(summary.totalInterest)}</span>
                    </div>
                    <p className="text-lg font-bold text-red-600 tabular-nums">
                      {formatMoney(summary.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail List for Mobile */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700">还款明细</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {matchedRecords.map((record: RepaymentRecord, index: number) => (
                  <div key={index} className="px-4 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-500">{record.repaymentDate}</span>
                      <span className="text-base font-bold text-red-600 tabular-nums">
                        {formatMoney(record.totalAmount)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>本金: {formatMoney(record.principal)}</span>
                      <span>利息: {formatMoney(record.interest)}</span>
                    </div>
                    {record.repaymentAccount && (
                      <div className="text-xs text-slate-400 mt-1">
                        还款账号: {record.repaymentAccount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Not Found */}
        {hasSearched && notFound && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">未找到相关还款记录</p>
            <p className="text-xs text-slate-400">请确认企业名称是否正确，或联系管理员</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8 pb-4">
          还款计划查询系统
        </p>
      </main>
    </div>
  );
}
