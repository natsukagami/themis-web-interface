import { Router } from 'express'
import Debug from 'debug'
import { join } from 'path'
import config from '../controls/config'
import createBrute from '../controls/rate-limiter'
import { removeLog } from '../controls/judgelog'
import { User } from '../controls/user'
import { addScore, addSubmit } from '../controls/userlog'
import { promisify } from 'util'
import { writeFile } from 'fs'

const debug = Debug('themis:router:submit')
const router = Router()
export default router

const submitPath = join(process.cwd(), 'data', 'submit')

if (config.rateLimiter && config.rateLimiter.submit !== null) {
  debug('Rate limiter enabled.')
  const rateLimiter = createBrute(config.rateLimiter.submit)
  router.post('/', rateLimiter.prevent)
}

router.use((req, res, next) => {
  // If contest mode is enabled and contest hasn't started, do not allow submitting.
  if (config.contestMode.enabled) {
    if (config.contestMode.startTime > new Date()) {
      return res.json('Cuộc thi chưa bắt đầu!')
    }
    // Don't allow when contest time's over.
    if (config.contestMode.endTime < new Date()) {
      return res.json('Cuộc thi đã kết thúc!')
    }
  }

  next()
})

interface SubmitRequest {
  problem: string
  ext: string
  content: string
}

router.post('/', async (req, res, next) => {
  if (!req.user) {
    // Not logged in
    return next(new Error('Bạn phải đăng nhập'))
  }

  const q = req.body as SubmitRequest
  if (!q.problem || !q.ext || !q.content) {
    return next(new Error('Invalid request'))
  }

  q.ext = q.ext.toLowerCase()
  q.problem = q.problem.toUpperCase()

  // Clean logs before writing
  removeLog(req.user.username, q.problem, q.ext)

  try {
    await addScore(req.user.username, q.problem, q.content)
    await addSubmit(
      req.user.username,
      `0[${req.user.username}][${q.problem}]${q.ext}`,
      q.content
    )
    await promisify(writeFile)(
      join(
        submitPath,
        `0[${(req.user as User).username}][${q.problem}]${q.ext}`
      ),
      q.content
    )

    res.json(true)
  } catch (e) {
    next(e)
  }
})
