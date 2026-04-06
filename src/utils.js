export function topNRandom(scoredMoves, n = 1) {
  if (!scoredMoves || scoredMoves.length === 0) return null;
  const sorted = [...scoredMoves].sort((a, b) => b.score - a.score);
  return { chosen: sorted[0], topN: sorted.slice(0, n), sorted };
}
