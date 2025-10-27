export function indexForNewItemInSortedList(list: string[], item: string) {
  let left = 0
  let right = list.length - 1

  while (left <= right) {
    const mid = Math.floor((right + left) / 2)
    const direction = list[mid].localeCompare(item)
    if (direction === 0) {
      return mid
    } else if (direction === -1) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return left
}
