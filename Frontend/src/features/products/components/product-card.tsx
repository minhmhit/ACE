import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/domain/product.types"
import { resolveProductImage } from "@/features/products/utils/image"

interface ProductCardProps {
  product: Product
  mode?: "grid" | "list"
}

export function ProductCard({ product, mode = "grid" }: ProductCardProps) {
  const imageSrc = resolveProductImage(product.imageUrl)

  return (
    <article
      className={cn(
        "overflow-hidden rounded-3xl border border-white/45 bg-white/60 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl",
        mode === "list" && "flex flex-col md:flex-row",
      )}
    >
      <div className={cn("relative bg-slate-100/70", mode === "grid" ? "aspect-[4/3]" : "md:w-56") }>
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          unoptimized
          loader={({ src }) => src}
          className={cn(
            "h-full w-full object-cover",
            mode === "list" ? "max-h-56 md:max-h-none" : "",
          )}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">#{product.id}</Badge>
          {product.category?.name ? <span className="text-xs text-slate-500">{product.category.name}</span> : null}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-slate-800 md:text-lg">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-emerald-700">
            {product.price.toLocaleString("vi-VN")} đ
          </p>
          <Link
            className={buttonVariants({ variant: "default" })}
            href={`/products/${product.id}`}
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  )
}
