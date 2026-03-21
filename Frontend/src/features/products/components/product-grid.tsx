import { ProductCard } from "@/features/products/components/product-card"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/domain/product.types"

interface ProductGridProps {
  products: Product[]
  mode: "grid" | "list"
}

export function ProductGrid({ products, mode }: ProductGridProps) {
  return (
    <div
      className={cn(
        mode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4",
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} mode={mode} />
      ))}
    </div>
  )
}
