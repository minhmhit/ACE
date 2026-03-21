export type EmploymentType = "FULL_TIME" | "PART_TIME" | "INTERN" | "CONTRACT"

export type EmployeeStatus = "PROBATION" | "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "TERMINATED"

export interface Department {
  id: number
  code: string
  name: string
  description?: string
  managerEmployeeId?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Position {
  id: number
  code: string
  name: string
  description?: string
  levelNo: number
  isActive: boolean
}

export interface Employee {
  id: number
  userId: number
  employeeCode: string
  departmentId: number
  employmentType: EmploymentType
  status: EmployeeStatus
  hireDate: string
  officialDate?: string
  terminationDate?: string
  baseSalary: number
  allowanceAmount: number
}

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

export interface LeaveType {
  id: number
  code: string
  name: string
  isPaid: boolean
  requiresAttachment: boolean
  maxDaysPerYear?: number
}

export interface LeaveRequest {
  id: number
  employeeId: number
  leaveTypeId: number
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveRequestStatus
  approvedByEmployeeId?: number
  rejectedReason?: string
  createdAt: string
}

export interface ResignationRequest {
  id: number
  employeeId: number
  desiredLastWorkingDate: string
  reason: string
  status: LeaveRequestStatus
  approvedByEmployeeId?: number
  rejectedReason?: string
}
