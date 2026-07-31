export interface RepaymentRecord {
  borrowerName: string;
  insuredNames: string;
  repaymentAccount: string;
  principal: number;
  interest: number;
  totalAmount: number;
  repaymentDate: string;
}

export interface BatchData {
  id: string;
  createdAt: number;
  records: RepaymentRecord[];
  fileName: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface ParseResult {
  records: RepaymentRecord[];
  uniqueCompanies: Set<string>;
  errors: string[];
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}
