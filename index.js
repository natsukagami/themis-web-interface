/**
 * One should be noted that this project does not use any form of outside DB.
 * Instead for session-based data we use LokiJS, and for contests and submit logs
 * (yes we have submit logs) we have persistent NeDB for that.
 */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLogger = require('morgan');
const path = require('path');
const debug = require('debug');
const http = require('http');
const passport = require('passport');
const session = require('express-session');
const lokiStore = require('connect-loki')(session);

try {
	require('./config');
} catch (e) {
	throw new Error('Please configure your config.js file!');
}
global.Config = require('./config');

const PORT = global.Config.port || process.env.PORT || 8088;

let app = express();

// Parsers
app.use(expressLogger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
	store: new lokiStore({
		path: path.join(process.cwd(), 'data', '.sessions.db'),
		logErrors: debug('kjudge-contest:server:session')
	}),
	secret: global.Config.sessionSecret,
	saveUninitialized: false,
	resave: false
}));
passport.use(require('./controls/passport'));
app.use(passport.initialize());
app.use(passport.session());

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if (app.get('env') === 'development') {
	app.use((req, res, next) => {
		res.locals.pretty = true;
		next();
	});
}

// Public static directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Declare global constants
app.use((req, res, next) => {
	res.locals.kjudgeVersion = process.env.npm_package_version;
	next();
});

// Routes
app.use('/', require('./routes/index'));

app.use((req, res, next) => {
	let err = new Error('Không tìm thấy trang');
	err.status = 404;
	next(err);
});

// Error handlers
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('error', {
		title: err.message,
		message: err.message,
		error: (app.get('env') === 'development' ? err : {})
	});
	next.a = null; // Dummy command
});

// Create HTTP Server
app.set('port', PORT);

let httpServer = http.createServer(app);

httpServer.debug = debug('themis:server');

httpServer.on('error', error => {
	if (error.syscall !== 'listen') {
		// System-specific error, throw then
		throw error;
	}
	let bind = typeof port === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
	// Handle specific listen errors with friendly messages
	switch (error.code) {
	case 'EACCES':
		httpServer.debug(bind + ' requires elevated privileges');
		process.exit(1);
		break;
	case 'EADDRINUSE':
		httpServer.debug(bind + ' is already in use');
		process.exit(1);
		break;
	default:
		throw error;
	}
});

httpServer.on('listening', () => {
	let addr = httpServer.address();
	let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	httpServer.debug('Listening on ' + bind + '. Ctrl-C to stop the server.');
});

httpServer.listen(PORT);
