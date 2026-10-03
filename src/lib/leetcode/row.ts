// Compact tuple row format for the registry source files.
// [num, slug, title, diff(0=Easy/1=Medium/2=Hard), topics, lists, companies, free?]
// topics/lists/companies are pipe-separated; free defaults to 1 (free) when
// the 8th element is omitted.
export type LcRow =
  | [number, string, string, 0 | 1 | 2, string, string, string]
  | [number, string, string, 0 | 1 | 2, string, string, string, 0 | 1];
