interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Đã có lỗi xảy ra",
  description = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200/70 bg-red-50/70 p-8 text-center backdrop-blur-lg">
      <h3 className="font-heading text-lg font-semibold text-red-700">{title}</h3>
      <p className="mt-2 text-sm text-red-600">{description}</p>
      {onRetry ? (
        <button
          className="mt-4 rounded-xl border border-red-300 bg-white/70 px-4 py-2 text-sm text-red-700"
          onClick={onRetry}
          type="button"
        >
          Thử lại
        </button>
      ) : null}
    </div>
  )
}
