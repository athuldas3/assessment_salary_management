import { describe, expect, it } from "vitest";

import {
  cycleSort,
  DEFAULT_SORTS,
  formatSortLabel,
  getSortForField,
} from "./sortUtils";

describe("sortUtils", () => {
  it("adds a new field with ascending order", () => {
    expect(cycleSort(DEFAULT_SORTS, "country")).toEqual([
      { field: "full_name", order: "asc" },
      { field: "country", order: "asc" },
    ]);
  });

  it("cycles an active field through asc, desc, and remove", () => {
    const withCountry = cycleSort(DEFAULT_SORTS, "country");
    const desc = cycleSort(withCountry, "country");
    const removed = cycleSort(desc, "country");

    expect(desc).toEqual([
      { field: "full_name", order: "asc" },
      { field: "country", order: "desc" },
    ]);
    expect(removed).toEqual(DEFAULT_SORTS);
  });

  it("returns sort metadata for headers", () => {
    const sorts = [
      { field: "country" as const, order: "asc" as const },
      { field: "salary" as const, order: "desc" as const },
    ];

    expect(getSortForField(sorts, "country")).toEqual({
      active: true,
      order: "asc",
      priority: 1,
    });
    expect(getSortForField(sorts, "salary")).toEqual({
      active: true,
      order: "desc",
      priority: 2,
    });
    expect(getSortForField(sorts, "department")).toEqual({
      active: false,
      order: "asc",
      priority: null,
    });
  });

  it("formats sort labels for chips", () => {
    expect(formatSortLabel({ field: "salary", order: "desc" })).toBe("Salary (DESC)");
  });
});
