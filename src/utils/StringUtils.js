export function capitalize(string) {
  return `${string[0].toUpperCase()}${string.slice(1)}`
}

export function truncateNumberToTwoDecimals(number) {
  return +number.toString().slice(0, (number.toString().indexOf(".") + 3));
}

export function replaceSpaceWithDash(string) {
  return string.replaceAll(' ', '-');
}