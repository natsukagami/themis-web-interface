import * as path from 'path'
import rEs from 'escape-string-regexp'
import globalize from 'globalize'
import * as fs from 'fs'
import { promisify } from 'util'
import Debug from 'debug'

import { addScore } from './scoring'
import { addSubmit } from './userlog'

const debug = Debug('themis:judgelog')

globalize.load(require('../../cldr-data/main/en/numbers'))
globalize.load(require('../../cldr-data/main/vi/numbers'))
globalize.load(require('../../cldr-data/supplemental/numberingSystems'))
globalize.load(require('../../cldr-data/supplemental/likelySubtags'))

const logsPath = path.join(process.cwd(), 'data', 'submit', 'logs')

/**
 * Try converting string to number with two regional settings (en_US and vi_VN).
 */
function gNumber (str: string): number {
  const a = (globalize as any)('en').numberParser()
  const b = (globalize as any)('vi').numberParser()
  if (isNaN(a(str))) return b(str)
  return a(str)
}

/**
 * For each test, a struct for its information is presented as below.
 */
export interface Test {
  id: string
  score: number
  time: number
  verdict: string
}

/**
 * The Log structure.
 */
export interface LogContent {
  verdict: string | number
  details: string | Test[]
}

/**
 * Log is an object that wraps a Log file.
 */
export class Log {
  /**
   * Returns the log filename given its parameters.
   */
  static filename (user: string, problem: string, ext: string): string {
    return path.join(logsPath, `0[${user}][${problem}]${ext}.log`)
  }

  /**
   * Internal function, parses the .log file into Log's content.
   * Parameters were given to get the log file's filename.
   */
  static parse (user: string, problem: string, content: string): LogContent {
    const lines = content.split('\r\n') // Must be \r\n because Windows
    const verdict = (lines[0].match(
      new RegExp(rEs(`${user}‣${problem}: `) + '(.+)', 'i')
    ) as RegExpMatchArray)[1]

    if (isNaN(gNumber(verdict))) {
      // Verdict summary is not a number, therefore the lines following the
      // first are just raw output.
      return {
        verdict: verdict,
        details: lines.slice(2).join('\r\n')
      }
    }

    const res = lines.slice(4)
    const details = []
    const rFirstLine = new RegExp(
      rEs(`${user}‣${problem}‣`) + '(.+)' + rEs(': ') + '(.+)',
      'i'
    )
    for (let i = 0; i + 1 < res.length; i += 3) {
      // First we rule out some special cases
      // like TLE and RTE.
      if (res[i + 1] === 'Chạy quá thời gian') {
        details.push({
          id: (res[i].match(rFirstLine) as RegExpMatchArray)[1],
          score: gNumber((res[i].match(rFirstLine) as RegExpMatchArray)[2]),
          time: 0,
          verdict: res[i + 1]
        })
        --i
        continue
      }
      if (res[i + 1] === 'Chạy sinh lỗi') {
        details.push({
          id: (res[i].match(rFirstLine) as RegExpMatchArray)[1],
          score: gNumber((res[i].match(rFirstLine) as RegExpMatchArray)[2]),
          time: 0,
          verdict: res[i + 1] + ': ' + res[i + 2]
        })
        continue
      }
      if (!rFirstLine.test(res[i])) {
        if (!details.length) {
          // Ignore, invalid log
        } else {
          // Append to last log
          details[details.length - 1].verdict += '\n' + res[i]
        }
        i -= 2
        continue // Move to next line
      }
      // Here goes the final generic log format.
      details.push({
        id: (res[i].match(rFirstLine) as RegExpMatchArray)[1],
        score: gNumber((res[i].match(rFirstLine) as RegExpMatchArray)[2]),
        time: gNumber(
          (res[i + 1].match('Thời gian ≈ (.+) giây') as RegExpMatchArray)[1]
        ),
        verdict: res[i + 2]
      })
    }
    return {
      verdict: gNumber(verdict),
      details: details
    }
  }

  public content: LogContent

  constructor (
    public created: Date,
    public user: string,
    public problem: string,
    content?: string
  ) {
    if (content === undefined) this.content = { details: [], verdict: '' }
    else this.content = Log.parse(user, problem, content)

    // When a new log is parsed, we should also update
    // the contestant's score to the scoreboard and userlog.
    addScore(user, problem, this.content.verdict)
    addSubmit(user, problem, JSON.stringify(this.content))
  }
}

export const Logs: {
  [username: string]: {
    [filename: string]: Log;
  };
} = {}

/**
 * Asynchronorously gets the latest log.
 * This first checks for any un-parsed log file, and fallback to
 * the latest parsed when none is available.
 */
export async function getLog (
  user: string,
  problem: string,
  ext: string
): Promise<Log | null> {
  if (!Logs[user]) Logs[user] = {}

  try {
    const stat = await promisify(fs.stat)(Log.filename(user, problem, ext))

    if (
      Logs[user][problem + ext] === undefined ||
      Logs[user][problem + ext].created < stat.mtime
    ) {
      debug(`New log for ${user} on ${problem + ext}`)
      // newer log available
      try {
        const contents = await promisify(fs.readFile)(
          Log.filename(user, problem, ext),
          'utf-8'
        )
        Logs[user][problem + ext] = new Log(
          stat.mtime,
          user,
          problem,
          contents
        )
      } catch (err) {
        throw err
      }
    }

    return Logs[user][problem + ext]
  } catch (err) {
    return null
  }
}

/** Sets the log from elsewhere. */
export function removeLog (user: string, problem: string, ext: string) {
  if (!Logs[user]) Logs[user] = {}

  Logs[user][problem + ext] = new Log(new Date(), user, problem)
}
