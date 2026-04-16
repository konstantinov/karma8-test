export function formatCount(value) {
  return new Intl.NumberFormat("ru-RU", { notation: value > 999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(
    value,
  );
}
