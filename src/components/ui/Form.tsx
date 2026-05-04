import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500";

export const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-700">
    <span className="font-medium">{label}</span>
    {children}
    {error ? <span className="text-xs text-red-600">{error}</span> : null}
  </label>
);

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`${baseClass} ${props.className || ""}`} />;

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${baseClass} ${props.className || ""}`} />
);

export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`min-h-[96px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 ${props.className || ""}`}
  />
);
