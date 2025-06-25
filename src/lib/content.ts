import { compareDesc } from "date-fns";

// sort by date
export const sortByDate = <T extends { data: { date: Date } }>(array: T[]): T[] => {
  const sortedArray = array.sort((a: T, b: T) =>
    compareDesc(a.data.date, b.data.date),
  );
  return sortedArray;
};

export const filterDrafts = <T extends { data: { draft?: boolean } }>(array: T[]): T[] => {
  if (import.meta.env.DEV) {
    return array;
  }
  const removeDrafts = array.filter(
    (data) => !("draft" in data.data) || !data.data.draft,
  );
  return removeDrafts;
};
