export function getLargestVersion(versionA: string, versionB: string): string {
  if (!versionA || !versionB)
    return versionA || versionB || '';

  const partsA = versionA.match(/(\d+)(?:\.(.*))?/)!;
  const partsB = versionB.match(/(\d+)(?:\.(.*))?/)!;

  if (partsA[1] == partsB[1])
    return partsA[1] + getLargestVersion(partsA[2], partsB[2]);

  const bIsLarger = parseInt(partsA[1], 10) <= parseInt(partsB[1], 10);
  return bIsLarger ? versionB : versionA;
}

export function toCamelCase(str: string): string {
  return str
    .split('_')
    .filter(s => s)
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join('');
}