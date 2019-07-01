/**
 * The userlog is a log that records all user submit historym
 * though source code is not saved (but rather a md5 hash of it).
 * It is mainly used to find out suspicious actions and in the
 * event of score loss, used as a proof of score.
 */

import * as path from 'path'

import md5 from 'md5'
import Debug from 'debug'
import nedb from 'nedb'
import { promisify } from 'util'

const debug = Debug('themis:userlog')

interface IUser {
  _id?: string
  scores: {
    [filename: string]: string;
  }
  submits: {
    [filename: string]: string;
  }
  username: string
}

const UserLog = new nedb({
  autoload: true,
  filename: path.join(process.cwd(), 'data', '.userlog.db')
})

/**
 * Adds a new user into the user log.
 * Returns NULL if the user already exists.
 */
export async function addUser (username: string): Promise<IUser | null> {
  return new Promise<IUser | null>((resolve, reject) => {
    UserLog.findOne<IUser>({ username }, (err, user) => {
      if (err) {
        return reject(err)
      }
      if (user === null) {
        // Adds a new user if the user is not found.
        UserLog.insert<IUser>(
          {
            scores: {},
            submits: {},
            username
          },
          (err, user) => {
            if (err) {
              reject(err)
            }
            resolve(user)
          }
        )
      } else return resolve(null) // No new user added
    })
  })
}

/**
 * Receives the user's log
 */
export async function getUser (username: string): Promise<IUser | null> {
  return new Promise<IUser | null>((resolve, reject) => {
    UserLog.findOne<IUser>({ username }, (err, user) => {
      if (err) reject(err)
      else resolve(user ? user : null)
    })
  })
}

/**
 * Add a score.
 * New score overrides old ones, no matter how different.
 */
export async function addSubmit (
  username: string,
  filename: string,
  contents: string
) {
  try {
    const user = await getUser(username)
    if (user === null) {
      throw new Error(`Username ${username} queried for submit but not found`)
    }
    UserLog.update(
      { _id: user._id },
      {
        $set: { [`submits.${filename}`]: md5(contents.replace(/\s/g, '')) }
      }
    )
  } catch (err) {
    debug(err)
  }
}

/**
 * Add a score.
 * New score overrides old ones, no matter how different.
 */
export async function addScore (
  username: string,
  problem: string,
  contents: string
): Promise<void> {
  try {
    const user = await getUser(username)
    if (user === null) throw new Error('User not found: ' + username)

    return promisify(UserLog.update.bind(UserLog))(
      { _id: user._id },
      {
        $set: { [`scores.${problem}`]: contents }
      }
    ).then(() => undefined)
  } catch (e) {
    debug(e)
  }
}
