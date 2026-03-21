// ═══════════════════════════════════════════════════════════════
//  FUZZY MATCHING — handles typos in medicine names
// ═══════════════════════════════════════════════════════════════
// Uses Levenshtein distance to find close matches.
// "Parasetamol" → "Paracetamol" ✅
// "Amoxicilin"  → "Amoxicillin" ✅
// "Cetzine"     → "Cetirizine"  ✅

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

// ─── Find the best fuzzy match ────────────────────────────────
// Returns { match, distance, score } or null if no close match.
// threshold = max allowed distance (scales with word length).
function fuzzyFind(query, candidates) {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return null;

  // Dynamic threshold: allow ~30% character errors
  const maxDistance = Math.max(2, Math.floor(q.length * 0.35));
  let best = null;

  for (const candidate of candidates) {
    const c = candidate.toLowerCase();
    const dist = levenshtein(q, c);

    // Also check if query is a prefix (e.g., "para" → "paracetamol")
    const isPrefix = c.startsWith(q) || q.startsWith(c);

    if (dist <= maxDistance || isPrefix) {
      const score = isPrefix ? 0.5 : dist / Math.max(q.length, c.length);
      if (!best || score < best.score) {
        best = { match: candidate, distance: dist, score, isPrefix };
      }
    }
  }

  return best;
}

// ─── Find multiple fuzzy matches ──────────────────────────────
// Returns top N candidates sorted by similarity.
function fuzzyFindAll(query, candidates, topN = 3) {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];

  const maxDistance = Math.max(3, Math.floor(q.length * 0.45));
  const results = [];

  for (const candidate of candidates) {
    const c = candidate.toLowerCase();
    const dist = levenshtein(q, c);
    const isPrefix = c.startsWith(q) || q.startsWith(c);

    if (dist <= maxDistance || isPrefix) {
      results.push({
        match: candidate,
        distance: dist,
        score: isPrefix ? 0.5 : dist / Math.max(q.length, c.length),
      });
    }
  }

  results.sort((a, b) => a.score - b.score);
  return results.slice(0, topN);
}

module.exports = { fuzzyFind, fuzzyFindAll, levenshtein };
