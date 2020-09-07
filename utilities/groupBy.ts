/**
 * Group items from an array together by some criteria or value.
 * @param list The array to group items from
 * @param getKey A function returning the key to group by
 * @return The grouped object
 */
export function groupBy<T, K extends keyof any>(
  list: T[],
  getKey: (item: T) => K,
) {
  return list.reduce((previous, currentItem) => {
    const group: K = getKey(currentItem);

    // If the key doesn't exist yet, create it
    if (!previous[group]) previous[group] = [];

    // Push the value to the object
    previous[group].push(currentItem);

    // Return the object to the next item in the loop
    return previous;
  }, {} as Record<K, T[]>);
}
