import { compareDesc } from "date-fns";

// sort by date
export const sortByDate = <T extends { data: { date: string } }>(array: T[]) => {
  const sortedArray = array.sort((a: T, b: T) =>
    compareDesc(new Date(a.data.date), new Date(b.data.date)),
  );
  return sortedArray;
};

export const filterDrafts = <T extends { data: { draft?: boolean } }>(array: T[]) => {
  if (import.meta.env.DEV) {
    return array;
  }
  const removeDrafts = array.filter(
    (data) => !("draft" in data.data) || !data.data.draft,
  );
  return removeDrafts;
};
