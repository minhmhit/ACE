export interface SalesOverview {
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
}

export interface LowStockItem {
  productId: number
  productName: string
  availableStock: number
}

export interface DashboardRecentOrder {
  id: number
  customerName?: string
  status: string
  totalAmount: number
  orderDate: string
}

export interface DateRangeQuery {
  from?: string
  to?: string
  limit?: number
  recentLimit?: number
}
