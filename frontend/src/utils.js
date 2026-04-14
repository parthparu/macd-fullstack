export function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return "--";
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(1)}K`
      : value.toFixed(2);
}

export function presetDomain(data, preset) {
  if (!data?.length || preset === "ALL") return null;
  const end = new Date(data[data.length - 1].date);
  const start = new Date(end);
  const monthMap = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };
  if (preset === "YTD") {
    start.setMonth(0, 1);
  } else if (monthMap[preset]) {
    start.setMonth(start.getMonth() - monthMap[preset]);
  } else {
    return null;
  }
  return [start, end];
}
