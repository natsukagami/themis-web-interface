import Debug from 'debug'

const debug = Debug('themis-scoring')

/**
 * Scoring works very simply.
 * For each log parsed a score is updated into a global "scores"
 * collection, that contains the score for each contestant/problem.
 */

export const scores: {
  [user: string]: {
    total: number;
    [problem: string]: number;
  };
} = {}

/**
 * Adds a score into the collection.
 * New score overrides old ones, no matter how different.
 * Non-numeric verdicts are treated as 0.
 * @param user    The user that submitted the file.
 * @param problem The problem that was attempted.
 * @param verdict The given submission's Log.verdict.
 */
export function addScore (
  user: string,
  problem: string,
  verdict: string | number
) {
  const score = isNaN(Number(verdict)) ? 0 : Number(verdict)
  if (!scores[user]) {
    scores[user] = { total: 0 }
  }
  if (!scores[user][problem]) {
    scores[user][problem] = 0
  }
  scores[user].total += score - scores[user][problem]
  scores[user][problem] = score
  debug(`New score ${score} for ${user} on ${problem}`)
}
