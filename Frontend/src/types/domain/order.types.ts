export type OrderStatus = "PENDING" | "SHIPPING" | "COMPLETED" | "CANCELLED"

export interface CartItemRequest {
  cartItemId?: number
  productId: number
  variantId?: number | null
  quantity: number
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  variantId?: number
  quantity: number
  unitPrice: number
  productName?: string
}

export interface Order {
  id: number
  orderDate: string
  shipAddress: string
  status: OrderStatus
  totalAmount: number
  userId: number
  couponId?: number
  items?: OrderItem[]
}

export interface CreateOrderRequest {
  cartItems: CartItemRequest[]
  shipAddress: string
  couponId?: number | null
}

export interface UpdateOrderStatusRequest {
  status: Exclude<OrderStatus, "PENDING">
}
