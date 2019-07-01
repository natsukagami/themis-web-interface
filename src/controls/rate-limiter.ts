/**
 * Ratelimit controls are VERY fishy T_T
 */
const brute = require('express-brute')
const bruteNedb = require('express-brute-nedb')
import { join } from 'path'
import Debug from 'debug'

/**
 * Let the object self-compact. Fixes the previously commented
 * problem about filesize.
 */
let store = new bruteNedb({
  filename: join(process.cwd(), 'data', '.ratelimits.db')
})

/** Creates a rate-limiter with an array of options. */
export default function createBrute (
  options: [number, number, number, number] = [0, 1, 1, 1]
) {
  return new brute(
    store,
    Object.assign(
      {},
      {
        handleStoreError: Debug('themis:ratelimit')
      },
      {
        freeRetries: options[0],
        minWait: options[1],
        maxWait: options[2],
        lifetime: options[3]
      }
    )
  )
}
