import passport from 'passport'
import md5 from 'md5'
import { User } from './user'

import { Strategy } from 'passport-local'

/**
 * A special failure that occurs when user lookup fails.
 * In this case, instead of showing an error, one should be logged out immediately.
 */
export const deserializeFail = new Error('User not found!')

passport.serializeUser<User, string>((user, cb) => {
  cb(null, user.username)
})

passport.deserializeUser<User, string>((id, cb) => {
  const user = User.find(id)
  if (user === null) return cb(deserializeFail, undefined)
  cb(null, user)
})

export default new Strategy((username, password, cb) => {
  const user = User.find(username)
  if (user === null) return cb(null, false, { message: 'User not found!' })
  if (user.password !== md5(password)) {
    return cb(null, false, { message: 'Wrong password' })
  }
  cb(null, user)
})
