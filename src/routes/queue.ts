import { Router } from 'express'
import { join } from 'path'
import { promisify } from 'util'
import { readdir, promises, stat } from 'fs'

const router = Router()
export default router

const submitPath = join(process.cwd(), 'data', 'submit')

// Implements a periodic counter
let count = 0
const counter = async function () {
  const files = await promisify(readdir)(submitPath, 'utf8')

  count = (await Promise.all(
    files
      .filter(file => file !== 'readme.md') // Exclude readme, because obvious
      .map(item => promisify(stat)(join(submitPath, item))) // Filter out folders
  )).filter(s => s.isFile).length

  setTimeout(counter, 5000)
}
counter()

router.post('/', (req, res) => res.json(count)) // Number of items in queue
