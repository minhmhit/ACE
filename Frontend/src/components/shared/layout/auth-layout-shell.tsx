interface AuthLayoutShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthLayoutShell({
  title,
  description,
  children,
}: AuthLayoutShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.25),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.20),transparent_35%),radial-gradient(circle_at_50%_85%,rgba(14,165,233,0.18),transparent_40%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/65 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-heading font-semibold text-slate-800">
            {title}
          </h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
