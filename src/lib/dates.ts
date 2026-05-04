export const formatDate = (value: string): string =>
  value
    ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
        new Date(`${value}T00:00:00`),
      )
    : "-";

export const isPastDate = (value: string): boolean => {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return target.getTime() < today.getTime();
};

export const compareByDateAsc = (a: string, b: string): number => a.localeCompare(b);
