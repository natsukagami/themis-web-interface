import express, { ErrorRequestHandler } from 'express'
import serveFavicon from 'serve-favicon'
import compression from 'compression'
import expressLogger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import debug from 'debug'
import passport from 'passport'
import axios from 'axios'
const lokiStore = require('connect-loki')(session)
import { join } from 'path'
import { readFileSync } from 'fs'
import { createServer } from 'http'

/**
 * One should be noted that this project does not use any form of outside DB.
 * Instead for session-based data we use LokiJS, and for contests and submit logs
 * (yes we have submit logs) we have persistent NeDB for that.
 */
try {
  require('../config')
} catch (e) {
  throw new Error('Hãy tạo các thiết lập mặc định trong file config.js!')
}
import config from './controls/config'
import routes from './routes'
import passportLocal, { deserializeFail } from './controls/passport'

const PORT = config.port || process.env.PORT || 8888

const app = express()
// Settings
app.set('trust proxy', 1)

// Public static directory
// It should bypass all parsers.
app.use(serveFavicon(join(process.cwd(), 'public', 'img', 'favicon.ico')))
app.use(compression())
/* app.use(/\/public\/js\/(index|scoreboard)\.js$/, (req, res, next) => {
  if (app.get('env') !== 'development') {
    // Use the gzipped versions
    req.url = req.url + '.gz'
    res.set('Content-Encoding', 'gzip')
    next()
  } else next()
}) */
app.use('/public', express.static(join(process.cwd(), 'public')))

// Parsers
app.use(
  expressLogger('dev', {
    skip: (req, res) => {
      return (
        (req.baseUrl === '/files' || req.baseUrl === '/contest') &&
        (res.statusCode === 200 || res.statusCode === 429)
      )
    }
  })
)
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(bodyParser.json())
app.use(cookieParser())
app.use(
  session({
    store: new lokiStore({
      path: join(process.cwd(), 'data', '.sessions.db'),
      logErrors: debug('kjudge-contest:server:session')
    }),
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false
  })
)
passport.use(passportLocal)
app.use(passport.initialize())
app.use(passport.session())

// View engine
app.set('views', join(process.cwd(), 'views'))
app.set('view engine', 'pug')
if (app.get('env') === 'development') {
  app.use((req, res, next) => {
    res.locals.pretty = true
    next()
  })
}

// Declare global constants
app.use((req, res, next) => {
  res.locals.config = config
  next()
})
try {
  const version = readFileSync('twi.version', 'utf-8')
  app.use((req, res, next) => {
    res.locals.TWIVersion = version
    next()
  })
} catch (e) {
  app.use((req, res, next) => {
    res.locals.TWIVersion = process.env.npm_package_version
      ? `v${process.env.npm_package_version} (git)`
      : 'unknown version'
    next()
  })
}

// Routes
app.use('/', routes)

app.use((req, res, next) => {
  let err: any = new Error('Không tìm thấy trang')
  err.status = 404
  next(err)
})

// Error handlers

// A special error handler for the user deserialization failure.
app.use(((err, req, res, next) => {
  if (err === deserializeFail) {
    req.logout() // Immediately logs the user out.
    debug('themis:controls:user')(
      'Failed to identify previously logged on user, logged out. Did you change the accounts file?'
    )
    return res.redirect('/')
  }
  // If not the error, simply pass.
  next(err)
}) as ErrorRequestHandler)

app.use(((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    title: err.message,
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  })
}) as ErrorRequestHandler)

// Create HTTP Server
app.set('port', PORT)

const httpServer = createServer(app)

const httpDebug = debug('themis:server')

httpServer.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    // System-specific error, throw then
    throw error
  }
  let bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT
  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      httpDebug(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      httpDebug(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
})

httpServer.on('listening', () => {
  let addr = httpServer.address()
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  httpDebug('Listening on ' + bind + '. Ctrl-C to stop the server.')
})

if (process.env.NODE_ENV === 'production') {
  // checks for a new version
  axios
    .get(
      'https://api.github.com/repos/natsukagami/themis-web-interface/releases'
    )
    .then(response => {
      if (response.status !== 200) {
        return httpDebug(
          'Failed to check for new version: Response status ' + response.status
        )
      }
      const versions = response.data
      if (versions[0].tag_name !== readFileSync('twi.version', 'utf-8')) {
        httpDebug(
          'Phiên bản mới: ' +
            versions[0].name +
            ', xin hãy tải xuống tại: ' +
            versions[0].assets[0].browser_download_url
        )
      }
    })
    .catch(err => {
      httpDebug('Failed to check for new version: ' + err)
    })
}

httpServer.listen(PORT)
