import { Router } from 'express'
import Debug from 'debug'
import config from '../controls/config'
import createBrute from '../controls/rate-limiter'
import { getLog } from '../controls/judgelog'

const router = Router()
export default router

const debug = Debug('themis:router:log')

if (config.rateLimiter && config.rateLimiter.logRequest !== null) {
  debug('Rate limiter enabled.')
  const rateLimiter = createBrute(config.rateLimiter.logRequest)
  router.post('/', rateLimiter.prevent)
}

interface LogRequest {
  user: string
  problem: string
  ext: string
}
/** Request a log */
router.post('/', async (req, res, next) => {
  const q = req.body as LogRequest
  if (!q.user || !q.problem || !q.ext) {
    return next(new Error('Invalid Request'))
  }

  try {
    const log = await getLog(q.user, q.problem, q.ext)
    if (log === null) return res.json(null)

    if (log.content.verdict === '' || isNaN(Number(log.content.verdict))) {
      // Technically an empty log
      return res.json(null)
    }

    if (
      config.contestMode.enabled &&
      config.contestMode.hideLogs &&
      config.contestMode.endTime > new Date()
    ) {
      return res.json({
        ...log,
        content: {
          verdict: 'Yes', // Yes = Judged but log is hidden
          details: []
        }
      })
    }

    res.json(log)
  } catch (e) {
    next(e)
  }
})
