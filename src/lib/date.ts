const rail = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Taipei",
});
const stamp = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  timeZone: "Asia/Taipei",
});
const byline = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Taipei",
});
export const formatRailDate = (date: string) => rail.format(new Date(date));
export const formatStampDate = (date: string) => stamp.format(new Date(date));
export const formatBylineDate = (date: string) => byline.format(new Date(date));
