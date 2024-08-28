const WILDCARD = '*';

export function wildcardMatch(target: string, pattern: string): boolean {
  const offsetPre = pattern.indexOf(WILDCARD);
  if (offsetPre < 0) return target == pattern;

  const prefix = pattern.slice(0, offsetPre);
  if (!target.startsWith(prefix)) return false;

  const offsetPost = pattern.lastIndexOf(WILDCARD) + 1;
  // Skip -1 check
  const postfix = pattern.slice(offsetPost);
  if (!target.endsWith(postfix)) return false;

  return inner(target.slice(offsetPre, offsetPost), pattern.slice(offsetPre, offsetPost));
}

function inner(target: string, pattern: string): boolean {
  const n = nextInfix(pattern);
  if (!n) return true;

  const offset = target.indexOf(n.infix);
  if (offset < 0) return false;

  return inner(target.slice(offset + n.infix.length), n.residual);
}

function nextInfix(pattern: string): { infix: string, residual: string } | null {
  // Find infix range
  let start = 1;
  while (pattern[start] == WILDCARD) start++;

  if (start >= pattern.length) return null;

  let end = start + 1;
  while (pattern[end] != WILDCARD) end++;

  return {
    infix: pattern.slice(start, end),
    residual: pattern.slice(end),
  };
}