import { Router } from 'express'
import config from '../controls/config'
import { scores } from '../controls/scoring'

const router = Router()
export default router

type ErrStatus = Error & { status?: number }

// Simply disables the scoreboard if it is not allowed.
router.use((req, res, next) => {
  if (config.allowScoreboard) return next()
  const x: ErrStatus = new Error('Page not found')
  x.status = 404
  next(x)
})

router.use((req, res, next) => {
  const scoreboard = Object.keys(scores).map(key => ({
    scores: scores[key],
    name: key,
    rank: 0
  }))

  const problems: string[] = []
  for (let u of scoreboard) {
    for (let p of Object.keys(u)) {
      if (p === 'name' || p === 'total') continue
      if (problems.indexOf(p) === -1) problems.push(p)
    }
  }
  problems.sort()

  scoreboard.sort((a, b) => {
    return b.scores.total - a.scores.total
  })

  // Assign actual ranking
  for (let i = 0; i < scoreboard.length; ++i) {
    const u = scoreboard[i]
    if (i > 0 && u.scores.total === scoreboard[i - 1].scores.total) {
      u.rank = scoreboard[i - 1].rank
    } else u.rank = i + 1
  }
  res.locals.scoreboard = scoreboard
  res.locals.problems = problems
  next()
})

router.get('/', (req, res) => {
  return res.render('scoreboard', {
    title: 'Bảng xếp hạng'
  })
})

router.post('/', (req, res) => {
  return res.json({
    problems: res.locals.problems,
    contestants: res.locals.scoreboard
  })
})
