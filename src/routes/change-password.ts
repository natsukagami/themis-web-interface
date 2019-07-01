import { Router } from 'express'
import md5 from 'md5'
import { User } from '../controls/user'

const router = Router()
export default router

router.get('/', (req, res) => {
  res.render('changePassword', {
    title: 'Đổi mật khẩu'
  })
})

interface ChangePasswordBody {
  oldPassword: string
  password: string
  retype: string
}

router.post('/', async (req, res, next) => {
  const q = req.body as ChangePasswordBody
  const user = req.user as User

  if (!q.oldPassword || !q.password || !q.retype) {
    return next(new Error('Invalid request'))
  }
  if (md5(q.oldPassword) !== user.password) {
    return next(new Error('Mật khẩu không chính xác!'))
  }
  if (q.password !== q.retype) {
    return next(new Error('Mật khẩu không trùng nhau!'))
  }
  user.password = md5(q.password)

  await user.save()
  res.redirect('/')
})
