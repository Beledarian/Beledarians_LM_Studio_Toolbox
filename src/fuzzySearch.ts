function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export function levenshteinDistance(a: string, b: string): number {
  const left = normalize(a);
  const right = normalize(b);
  const m = left.length;
  const n = right.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }

  return prev[n];
}

export function computeFuzzyScore(query: string, candidate: string): number {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;

  if (c.includes(q)) {
    const coverage = q.length / c.length;
    return Math.min(1, 0.85 + coverage * 0.15);
  }

  const distance = levenshteinDistance(q, c);
  const maxLen = Math.max(q.length, c.length);
  return Math.max(0, 1 - distance / maxLen);
}

export function rankFuzzyMatches(query: string, candidates: string[], limit = 5): Array<{ value: string; score: number }> {
  const ranked = candidates
    .map(value => ({ value, score: computeFuzzyScore(query, value) }))
    .sort((a, b) => b.score - a.score || a.value.length - b.value.length)
    .slice(0, limit);

  return ranked;
}
