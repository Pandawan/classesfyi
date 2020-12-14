/**
 * Filters the given list by removing duplicated elements. 
 * @param list The array to filter
 * @param getKey The comparison function, returns true if the two items are duplicated.
 * @return The array with unique elements.
 */
export function uniqWith<T>(
  list: T[],
  compare: (a: T, b: T) => boolean,
) {
  return list.filter((outerElement, index, self) =>
    index === self.findIndex(
      (innerElement) => compare(outerElement, innerElement),
    )
  );
}
