export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "PAID_LEAVE"
  | "UNPAID_LEAVE"
  | "SICK_LEAVE"
  | "MATERNITY_LEAVE"
  | "HOLIDAY"

export interface AttendanceItem {
  id: number
  employeeId: number
  workDate: string
  checkIn?: string
  checkOut?: string
  workMinutes: number
  overtimeMinutes: number
  status: AttendanceStatus
  note?: string
}

export interface AttendanceQuery {
  month?: number
  year?: number
  page?: number
  limit?: number
  employeeId?: number
}
