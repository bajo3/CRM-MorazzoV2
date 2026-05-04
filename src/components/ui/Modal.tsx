import type { ReactNode } from "react";

export const Modal = ({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl">
        <div className="flex flex-none items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="font-display text-xl font-bold text-slate-900">{title}</h3>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
