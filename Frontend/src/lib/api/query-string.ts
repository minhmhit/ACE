export type QueryValue = string | number | boolean | null | undefined

export type QueryParams = object

export function toQueryString<T extends QueryParams>(params: T = {} as T) {
  const searchParams = new URLSearchParams()

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      typeof value === "object" ||
      typeof value === "function"
    ) {
      return
    }

    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}
