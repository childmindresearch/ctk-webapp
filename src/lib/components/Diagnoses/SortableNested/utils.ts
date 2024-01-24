export function shortenText(str: string, maxLength = 200) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "..."
  }
  return str
}
