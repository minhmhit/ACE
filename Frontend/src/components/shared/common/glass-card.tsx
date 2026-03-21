import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/40 bg-white/55 p-6 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  )
}
