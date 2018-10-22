import { Router } from 'express'
import scoreboard from './scoreboard'
import login from './login'
import register from './register'
import log from './log'
import contest from './contest'
import submit from './submit'
import queue from './queue'
import files from './files'
import changePassword from './change-password'

const router = Router()
export default router

router.use('/scoreboard', scoreboard)
router.use('/login', login)
router.use('/register', register)
router.use('/log', log)

// From now on all paths require login
router.use((req, res, next) => {
  if (!req.user) return res.redirect('/login')
  res.locals.user = req.user
  next()
})

router.use('/contest', contest)
router.use('/submit', submit)
router.use('/queue', queue)
router.use('/files', files)
router.use('/change-password', changePassword)

router.get('/logout', (req, res) => {
  req.logout()
  return res.redirect('/')
})

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Trang chủ'
  })
})
