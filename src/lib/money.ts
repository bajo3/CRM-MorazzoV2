export const formatMoney = (value: number): string =>
  `$${Math.round(value || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

export const formatARS = formatMoney;

export const roundMoney = (value: number): number => Math.round((value || 0) * 100) / 100;
