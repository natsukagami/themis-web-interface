import { Router } from 'express'
import passport from 'passport'

const router = Router()
export default router

/**
 * If the user has logged in, redirect them out
 */
router.use((req, res, next) => {
  if (!req.user) return next()

  res.redirect('/')
})

// Loads the login page
router.get('/', (req, res) => {
  res.render('login', {
    title: 'Đăng nhập',
    failed: req.query.failed === 'true',
    registerSuccessful: req.query['register-successful'] === 'true'
  })
})

// Perform authentication
router.post(
  '/',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?failed=true'
  })
)
