export type PaginationRangeItem = number | 'ellipsis';

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Builds a condensed pagination range with ellipsis separators.
 * Ensures the first and last pages are always shown while keeping numbers readable.
 */
export function buildPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): PaginationRangeItem[] {
  if (totalPages <= 0) {
    return [1];
  }

  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const range: PaginationRangeItem[] = [1];

  let leftSibling = clamp(currentPage - siblingCount, 2, totalPages - 1);
  let rightSibling = clamp(currentPage + siblingCount, 2, totalPages - 1);

  if (currentPage <= 3) {
    leftSibling = 2;
    rightSibling = 3;
  } else if (currentPage >= totalPages - 2) {
    leftSibling = totalPages - 3;
    rightSibling = totalPages - 2;
  }

  if (leftSibling > 2) {
    range.push('ellipsis');
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    range.push(page);
  }

  if (rightSibling < totalPages - 1) {
    range.push('ellipsis');
  }

  range.push(totalPages);

  return range.filter((value, index, array) => array.indexOf(value) === index);
}
