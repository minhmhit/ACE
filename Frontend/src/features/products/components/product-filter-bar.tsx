"use client"

import { SearchInput } from "@/components/shared/common/search-input"
import { Button } from "@/components/ui/button"

interface ProductFilterBarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  sortBy: "name" | "price-asc" | "price-desc"
  onSortChange: (value: "name" | "price-asc" | "price-desc") => void
  viewMode: "grid" | "list"
  onViewModeChange: (value: "grid" | "list") => void
  onApply: () => void
  onReset: () => void
}

export function ProductFilterBar({
  keyword,
  onKeywordChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onApply,
  onReset,
}: ProductFilterBarProps) {
  return (
    <div className="rounded-2xl border border-white/45 bg-white/65 p-4 backdrop-blur-xl">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_auto_auto_auto]">
        <SearchInput
          value={keyword}
          onChange={onKeywordChange}
          placeholder="Tìm sản phẩm theo tên..."
        />

        <select
          value={sortBy}
          onChange={(event) =>
            onSortChange(event.target.value as "name" | "price-asc" | "price-desc")
          }
          className="h-11 rounded-2xl border border-white/60 bg-white/70 px-3 text-sm text-slate-700"
        >
          <option value="name">Sắp xếp: Tên A-Z</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>

        <div className="inline-flex rounded-2xl border border-white/60 bg-white/70 p-1">
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm ${viewMode === "grid" ? "bg-emerald-100 text-emerald-700" : "text-slate-600"}`}
            onClick={() => onViewModeChange("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm ${viewMode === "list" ? "bg-emerald-100 text-emerald-700" : "text-slate-600"}`}
            onClick={() => onViewModeChange("list")}
          >
            List
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button onClick={onApply}>Áp dụng</Button>
        </div>
      </div>
    </div>
  )
}
