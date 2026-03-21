export type PayrollPeriodStatus = "OPEN" | "LOCKED" | "PAID"

export type PayrollStatus = "DRAFT" | "FINALIZED" | "PAID"

export type PayrollItemType =
  | "BASE"
  | "ALLOWANCE"
  | "BONUS"
  | "DEDUCTION"
  | "INSURANCE"
  | "TAX"
  | "OTHER"

export interface PayrollPeriod {
  id: number
  code: string
  monthNo: number
  yearNo: number
  startDate: string
  endDate: string
  paymentDate?: string
  status: PayrollPeriodStatus
  createdAt: string
}

export interface PayrollItem {
  id: number
  payrollId: number
  itemType: PayrollItemType
  itemCode: string
  itemName: string
  amount: number
  formulaText?: string
}

export interface Payroll {
  id: number
  payrollPeriodId: number
  employeeId: number
  positionHistoryId: number
  baseSalary: number
  allowanceTotal: number
  bonusTotal: number
  deductionTotal: number
  grossSalary: number
  insuranceAmount: number
  taxAmount: number
  netSalary: number
  payableSalary: number
  status: PayrollStatus
  generatedAt?: string
  items?: PayrollItem[]
}
