const MULTIPLIER = 7919;
const SALT = 104729;

export const formatDisplayCode = (prefix, id) => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return `${prefix}-------`;

  const encoded = ((numericId * MULTIPLIER) + SALT)
    .toString(36)
    .toUpperCase()
    .padStart(6, '0');

  return `${prefix}-${encoded}`;
};
