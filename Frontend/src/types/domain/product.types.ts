export interface Category {
  id: number
  name: string
  description?: string
  isActive?: boolean
}

export interface ProductVariant {
  id: number
  productId: number
  name: string
  additionalPrice: number
  isActive?: boolean
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl?: string
  categoryId: number
  supplierId?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: Category
  variants?: ProductVariant[]
}

export interface ProductListQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
}

export interface ProductSearchRequest {
  keyword: string
  page?: number
  limit?: number
}
