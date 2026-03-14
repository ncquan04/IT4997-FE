export const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return "";
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + "đ"
  );
};
