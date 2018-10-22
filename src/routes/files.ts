import { Router } from 'express'
import { join, relative } from 'path'
import { walk } from 'walk'
import md5 from 'md5'
import config from '../controls/config'

const router = Router()
export default router

const filesPath = join(process.cwd(), 'data', 'files')

/** A mapping from the file's md5 hash to its path. */
interface FileList {
  [hash: string]: string
}

let fileList: FileList = {}

function rescanFileList () {
  const nwList: FileList = {}
  const w = walk(filesPath)

  w.on('file', (root, stats, next) => {
    if (stats.name === 'readme.md') return next() // Skip this file
    const filePath = join(relative(filesPath, root), stats.name)

    nwList[md5(filePath)] = filePath
    next()
  })

  w.on('end', () => {
    fileList = nwList
    setTimeout(rescanFileList, 5000) // Repeat the scan every 5 seconds
  })
}
rescanFileList()

// Sends the whole file list.
router.get('/', (req, res) => {
  res.json(fileList)
})

router.use((req, res, next) => {
  // If contest mode is enabled and contest hasn't started, do not serve files.
  if (config.contestMode.enabled && config.contestMode.startTime > new Date()) {
    return next(new Error('Cuộc thi chưa bắt đầu!'))
  }

  next()
})

declare global {
  namespace Express {
    interface Request {
      file: string // The filepath
    }
  }
}

// Load the file through "param"
router.param('id', (req, res, next, id) => {
  if (!(id in fileList)) {
    return next(new Error('Không tìm thấy file'))
  }

  req.file = fileList[id]
  next()
})

// Allow downloading the file upon request
router.get('/:id', (req, res) => {
  res.download(join(filesPath, req.file))
})
