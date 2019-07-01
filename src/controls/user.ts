import xml from 'xml2js'
import eventEmitter from 'events'
import md5 from 'md5'
import Debug from 'debug'
import { promisify } from 'util'
import { writeFile, readFile } from 'fs'
import { join } from 'path'
import { addUser } from './userlog'

const debug = Debug('themis:controls:user')

let xmlFile: any = null

/**
 * The XML Writer object saves the XML file on request every second
 */
const xmlWriter = new eventEmitter()

/**
 * Whether the XML build needs to be performed.
 */
let flag = false

/**
 * Build checks whether a build is needed, and perform it when
 * neccessary.
 */
async function build (): Promise<void> {
  if (!flag) {
    xmlWriter.emit('build-finish')
    return
  }
  debug('account.xml being updated.')
  flag = false

  const build = new xml.Builder()
  xmlWriter.emit('build-start')

  await promisify(writeFile)(
    join(process.cwd(), 'data', 'account.xml'),
    build.buildObject(xmlFile)
  )

  xmlWriter.emit('build-finish')
}

// On build finish, perform a check later.
xmlWriter.on('build-finish', () => {
  setTimeout(() => build(), 1000)
})

// Perform the first build
build()

/**
 * Stores user information
 */
export class User {
  static Users: { [username: string]: User } = {}

  /**
   * Find an user with the specified username.
   */
  static find (username: string): User | null {
    return username in User.Users ? User.Users[username] : null
  }

  /**
   * Adds an user to the XML file
   */
  static async add (username: string, password: string, name: string) {
    if (User.Users[username] !== undefined) {
      throw new Error('Username already exists')
    }

    const Rows = xmlFile.Workbook.Worksheet[0].Table[0].Row
    const newRow = {
      $: {
        'ss:AutoFitHeight': '0'
      },
      Cell: [
        {
          $: {
            'ss:StyleID': 's68'
          },
          Data: [
            {
              _: '0',
              $: {
                'ss:Type': 'Number'
              }
            }
          ]
        },
        {
          $: {
            'ss:StyleID': 's68'
          },
          Data: [
            {
              _: username,
              $: {
                'ss:Type': 'String'
              }
            }
          ]
        },
        {
          $: {
            'ss:StyleID': 's68'
          },
          Data: [
            {
              _: md5(password),
              $: {
                'ss:Type': 'String'
              }
            }
          ]
        },
        {
          $: {
            'ss:StyleID': 's68'
          },
          Data: [
            {
              _: name,
              $: {
                'ss:Type': 'String'
              }
            }
          ]
        },
        {
          $: {
            'ss:StyleID': 's68'
          },
          Data: [
            {
              _: '1',
              $: {
                'ss:Type': 'Number'
              }
            }
          ]
        },
        {
          $: {
            'ss:StyleID': 's68'
          }
        },
        {
          $: {
            'ss:StyleID': 's68'
          }
        },
        {
          $: {
            'ss:StyleID': 's68'
          }
        }
      ]
    }

    Rows[Object.keys(User.Users).length + 1] = newRow
    User.Users[username] = new User(username, md5(password), name, newRow)
    return User.Users[username].save()
  }

  constructor (
    public username: string,
    public password: string /*md5 hashed*/,
    public name: string,
    public row: any /*The user's row in the XML file.*/
  ) {
    addUser(this.username)
    debug(`User ${this.name} added.`)
  }

  async save () {
    this.row.Cell[1].Data[0]._ = this.username
    this.row.Cell[2].Data[0]._ = this.password
    // The following line fixes the bug where the XML
    // file turns unreadable because of Number password
    // being casted to string by md5 but the type did
    // not change.
    this.row.Cell[2].Data[0].$['ss:Type'] = 'String'
    this.row.Cell[3].Data[0]._ = this.name
    this.row.Cell[4].Data[0]._ = '1'
    flag = true
    return new Promise(resolve => xmlWriter.once('build-start', resolve))
  }
}

/**
 * Scans the .xml file and list all users.
 */
(async function scanUsers () {
  const file = await promisify(readFile)(
    join(process.cwd(), 'data', 'account.xml')
  ).catch(() => new Error('Please setup data/account.xml!'))

  const result = await promisify<xml.convertableToString, any>(xml.parseString)(
    file
  ).catch(() => new Error('Invalid data/account.xml file'))

  try {
    xmlFile = result
    const Rows = xmlFile.Workbook.Worksheet[0].Table[0].Row
    for (let i = 1; i < Rows.length; ++i) {
      if (!Rows[i].Cell[0].Data) break
      let username = Rows[i].Cell[1].Data[0]._
      let password = Rows[i].Cell[2].Data[0]._
      let name = Rows[i].Cell[3].Data[0]._
      if (Rows[i].Cell[4].Data[0]._ === '0') password = md5(password)
      User.Users[username] = new User(username, password, name, Rows[i])
      if (Rows[i].Cell[2].Data[0].$['ss:Type'] !== 'String') {
        // A hotfix for issue17, *sigh*
        User.Users[username].save()
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') throw e
    throw new Error('Invalid data/account.xml file')
  }
})()
