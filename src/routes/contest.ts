import { Router } from 'express'
import config from '../controls/config'
import Debug from 'debug'

const router = Router()
export default router

if (config.contestMode.enabled) {
  if (config.contestMode.startTime > config.contestMode.endTime) {
    throw new Error(
      'Invalid contest time! Start time should be earlier than end time!'
    )
  }

  Debug('themis:server')('Contest mode enabled.')

  router.get('/', (req, res) => {
    res.json({
      startTime: config.contestMode.startTime,
      endTime: config.contestMode.endTime
    })
  })
}
