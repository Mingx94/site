import { compareDesc } from "date-fns";

// sort by date
export const sortByDate = (array: any[]) => {
  const sortedArray = array.sort((a: any, b: any) =>
    compareDesc(new Date(a.data.date), new Date(b.data.date)),
  );
  return sortedArray;
};

export const filterDrafts = (array: any[]) => {
  if (import.meta.env.DEV) {
    return array;
  }
  const removeDrafts = array.filter(
    (data) => !("draft" in data.data) || !data.data.draft,
  );
  return removeDrafts;
};
