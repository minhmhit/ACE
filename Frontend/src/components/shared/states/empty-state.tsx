interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-8 text-center backdrop-blur-lg">
      <h3 className="font-heading text-lg font-semibold text-slate-800">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
