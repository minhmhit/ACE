interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5 space-y-2">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-heading font-semibold text-slate-800 md:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm text-slate-600 md:text-base">{description}</p>
      ) : null}
    </div>
  )
}
