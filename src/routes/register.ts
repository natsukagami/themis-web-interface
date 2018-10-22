import { Router } from 'express'
import config from '../controls/config'
import Debug from 'debug'
import createBrute from '../controls/rate-limiter'
import { Recaptcha } from 'express-recaptcha'
import { User } from '../controls/user'

const debug = Debug('themis:router:register')
const router = Router()
export default router

type ErrStatus = Error & { status?: number }

if (config.rateLimiter && config.rateLimiter.register !== null) {
  debug('Rate limiter enabled.')
  const rateLimiter = createBrute(config.rateLimiter.register)
  router.use(rateLimiter.prevent)
}

router.use((req, res, next) => {
  // Disable the router if registration is disabled
  if (!config.registration.allow) {
    const x: ErrStatus = new Error('Page not found')
    x.status = 404
    return next(x)
  }

  next()
})

const recaptcha = (() => {
  if (config.registration.allow) {
    if (config.registration.recaptcha.enable) {
      return new Recaptcha(
        config.registration.recaptcha.siteKey,
        config.registration.recaptcha.secretKey
      )
    }

    debug(
      'WARNING: Disabling ReCaptcha while allowing registration can put your server in danger of DoS!'
    )
  }
  return null
})()

router.use((req, res, next) => {
  // Redirect to home page if already logged in
  if (!req.user) return next()
  return res.redirect('/')
})

if (recaptcha) {
  router.get('/', recaptcha.middleware.render)
  router.post('/', recaptcha.middleware.verify)
}

router.get('/', (req, res) => {
  res.render('register', {
    title: 'Đăng kí',
    recaptcha: req.recaptcha || '',
    recaptchaFailed: req.query['recaptcha-failed'] === 'true',
    userExists: req.query['user-exists'] === 'true'
  })
})

interface RegisterRequest {
  username: string
  password: string
  name: string
}

router.post('/', async (req, res, next) => {
  if (recaptcha && req.recaptcha && req.recaptcha.error) {
    return res.redirect('/register?recaptcha-failed=true')
  }
  const q = req.body as RegisterRequest
  if (!q.username || !q.password || !q.name) {
    return next(new Error('Invalid request'))
  }
  try {
    await User.add(q.username, q.password, q.name)
    res.redirect('/login?register-successful=true')
  } catch (e) {
    res.redirect('/register?user-exists=true')
  }
})
