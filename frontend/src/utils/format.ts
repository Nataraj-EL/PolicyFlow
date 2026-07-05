/**
 * Formats a numeric value into localized Indian Rupee currency representation.
 * Standardizes groupings according to the Indian numbering system (e.g. Lakhs, Crores).
 */
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
};
