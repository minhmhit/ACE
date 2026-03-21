export interface CartItem {
  id: number
  cartId: number
  productId: number
  variantId?: number | null
  quantity: number
  unitPrice: number
  totalPrice: number
  productName?: string
  productImage?: string
}

export interface Cart {
  id: number
  userId: number
  items: CartItem[]
  totalQuantity: number
  subtotal: number
}

export interface AddToCartRequest {
  productId: number
  quantity: number
  variantId?: number | null
}

export interface UpdateCartItemRequest {
  quantity: number
}
