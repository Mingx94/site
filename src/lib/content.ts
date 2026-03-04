import { compareDesc } from "date-fns";

// sort by date
export const sortByDate = <T extends { date: Date }>(array: T[]): T[] => {
  return [...array].toSorted((a, b) => compareDesc(a.date, b.date));
};

export const filterDrafts = <T extends { draft?: boolean }>(
  array: T[],
): T[] => {
  if (import.meta.env.DEV) {
    return array;
  }
  return array.filter((data) => !data.draft);
};
