"use client"

import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
  page: number
  totalPages: number
  onChangePage: (nextPage: number) => void
}

export function PaginationControls({ page, totalPages, onChangePage }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/45 bg-white/65 px-4 py-3 backdrop-blur-xl">
      <p className="text-sm text-slate-600">
        Trang {page} / {Math.max(totalPages, 1)}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => onChangePage(page - 1)}>
          Trước
        </Button>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  )
}
