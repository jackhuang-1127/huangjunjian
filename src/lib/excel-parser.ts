import * as XLSX from 'xlsx';
import type { RepaymentRecord, ParseResult } from './types';

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,，\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function parseDate(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const y = date.y;
      const m = String(date.m).padStart(2, '0');
      const d = String(date.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(trimmed)) {
      return trimmed.replace(/\//g, '-');
    }
  }
  return String(value);
}

function toString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('Excel文件中没有工作表'));
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

        const records: RepaymentRecord[] = [];
        const uniqueCompanies = new Set<string>();
        const errors: string[] = [];
        let accountName = '';
        let accountNumber = '';
        const bankName = '宁波银行股份有限公司';

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const borrowerName = toString(row[0]);
          const insuredNames = toString(row[1]);
          const repaymentAccount = toString(row[2]);
          const principal = parseNumber(row[3]);
          const interest = parseNumber(row[4]);
          const totalAmount = parseNumber(row[5]);
          const repaymentDate = parseDate(row[6]);

          // 提取第一个记录的账户信息
          if (i === 1 && borrowerName && repaymentAccount) {
            accountName = borrowerName;
            accountNumber = repaymentAccount;
          }

          if (!borrowerName && !insuredNames) {
            errors.push(`第${i + 1}行：借款人客户名称和被保险人都为空，已跳过`);
            continue;
          }

          const record: RepaymentRecord = {
            borrowerName,
            insuredNames,
            repaymentAccount,
            principal,
            interest,
            totalAmount,
            repaymentDate,
          };
          records.push(record);

          if (borrowerName) uniqueCompanies.add(borrowerName);
          if (insuredNames) {
            insuredNames.split(/[,，]/).forEach((name) => {
              const trimmed = name.trim();
              if (trimmed) uniqueCompanies.add(trimmed);
            });
          }
        }

        resolve({
          records,
          uniqueCompanies,
          errors,
          accountName,
          accountNumber,
          bankName,
        });
      } catch (err) {
        reject(new Error(`Excel解析失败: ${err instanceof Error ? err.message : '未知错误'}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsArrayBuffer(file);
  });
}
