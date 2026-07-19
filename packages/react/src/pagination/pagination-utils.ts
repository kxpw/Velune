export type PageToken = number | "ellipsis";

export function getTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

/**
 * Builds a compact page list: 1 … 4 5 6 … 20
 */
export function buildPageList(
  page: number,
  totalPages: number,
  siblingCount = 1,
): PageToken[] {
  if (totalPages <= 1) {
    return [1];
  }

  const current = clampPage(page, totalPages);
  const siblings = Math.max(0, siblingCount);
  const start = Math.max(2, current - siblings);
  const end = Math.min(totalPages - 1, current + siblings);
  const tokens: PageToken[] = [1];

  if (start > 2) {
    tokens.push("ellipsis");
  }

  for (let i = start; i <= end; i += 1) {
    tokens.push(i);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis");
  }

  if (totalPages > 1) {
    tokens.push(totalPages);
  }

  // Deduplicate consecutive numbers from edge cases.
  return tokens.filter((token, index, list) => {
    if (index === 0) {
      return true;
    }
    return token !== list[index - 1];
  });
}
