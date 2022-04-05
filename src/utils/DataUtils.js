export function convertArrayToObject(array) {
  return Object.fromEntries(new Map([[...array]]));
}

export function convertArrayToStringEntry(array) {
  return array.join('').replaceAll(/[ ,]/g, '');
}