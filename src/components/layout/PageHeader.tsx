import type { ReactNode } from "react";

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="font-display text-xl font-bold text-slate-900">{title}</h1>
      {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
    {actions}
  </div>
);
