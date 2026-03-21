export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    sessions: ["auth", "sessions"] as const,
  },
  products: {
    products: (params?: Record<string, string | number | boolean>) =>
      ["products", "list", params] as const,
    productDetail: (productId: number | string) => ["products", "detail", productId] as const,
    featured: ["products", "featured"] as const,
    newest: ["products", "newest"] as const,
  },
  categories: {
    list: ["categories", "list"] as const,
    detail: (categoryId: number | string) => ["categories", "detail", categoryId] as const,
  },
  cart: {
    detail: ["cart", "detail"] as const,
  },
  orders: {
    myList: (params?: Record<string, string | number | boolean>) =>
      ["orders", "my-list", params] as const,
    detail: (orderId: number | string) => ["orders", "detail", orderId] as const,
  },
  payments: {
    methods: ["payments", "methods"] as const,
    myHistory: (params?: Record<string, string | number | boolean>) =>
      ["payments", "my-history", params] as const,
    detail: (paymentId: number | string) => ["payments", "detail", paymentId] as const,
  },
  employee: {
    me: ["employee", "me"] as const,
    attendance: (params?: Record<string, string | number | boolean>) =>
      ["employee", "attendance", params] as const,
    leaveRequests: (params?: Record<string, string | number | boolean>) =>
      ["employee", "leave-requests", params] as const,
    payrolls: (params?: Record<string, string | number | boolean>) =>
      ["employee", "payrolls", params] as const,
  },
} as const
