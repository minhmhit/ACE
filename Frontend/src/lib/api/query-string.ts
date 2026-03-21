export type QueryValue = string | number | boolean | null | undefined

export type QueryParams = Record<string, QueryValue>

export function toQueryString(params: QueryParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return
    }

    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}
