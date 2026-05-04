export const createId = (prefix: string): string => {
  const token = Math.random().toString(36).slice(2, 6).toUpperCase();
  const stamp = Date.now().toString().slice(-6);
  return `${prefix}-${stamp}${token}`;
};
