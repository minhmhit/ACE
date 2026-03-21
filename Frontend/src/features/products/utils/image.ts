const FALLBACK_IMAGE = "/images/products/placeholder.jpg"

export function resolveProductImage(imageUrl?: string) {
  if (!imageUrl) {
    return FALLBACK_IMAGE
  }

  const normalized = imageUrl.replace(/\\/g, "/").trim()

  if (!normalized) {
    return FALLBACK_IMAGE
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized
  }

  // Backend currently stores paths like ./asset/img/products/<file>
  // We remap them to public/images/products/<file>
  const assetProductsPrefix = "asset/img/products/"
  const normalizedWithoutDot = normalized.replace(/^\.\//, "")

  if (normalizedWithoutDot.startsWith(assetProductsPrefix)) {
    const fileName = normalizedWithoutDot.slice(assetProductsPrefix.length)
    return `/images/products/${fileName}`
  }

  if (normalized.startsWith("/")) {
    return normalized
  }

  return `/${normalizedWithoutDot}`
}

export function getFallbackProductImage() {
  return FALLBACK_IMAGE
}
