/**
 * One should be noted that this project does not use any form of outside DB.
 * Instead for session-based data we use LokiJS, and for contests and submit logs
 * (yes we have submit logs) we have persistent NeDB for that.
 */
const fs = require('fs');
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLogger = require('morgan');
const path = require('path');
const debug = require('debug');
const http = require('http');
const passport = require('passport');
const codefunPassport = require('./controls/passport');
const session = require('express-session');
const lokiStore = require('connect-loki')(session);
const axios = require('axios');

try {
	require('./config');
} catch (e) {
	throw new Error('Please configure your config.js file!');
}
global.Config = require('./config');

const PORT = global.Config.port || process.env.PORT || 8088;

let app = express();

// Settings
app.set('trust proxy', 1);

// Public static directory
// It should bypass all parsers.
app.use(require('serve-favicon')(path.join(process.cwd(), 'public', 'img', 'favicon.ico')));
app.use(compression());
app.use(/\/public\/js\/(index|scoreboard)\.js$/, (req, res, next) => {
	if (app.get('env') !== 'development') {
		// Use the gzipped versions
		req.url = req.url + '.gz';
		res.set('Content-Encoding', 'gzip');
		next();
	} else next();
});
app.use('/public', express.static(path.join(__dirname, 'public')));

// Parsers
app.use(expressLogger('dev', {
	skip: (req, res) => {
		return (req.baseUrl === '/log' || req.baseUrl === '/queue') &&
						(res.statusCode === 200 || res.statusCode === 429);
	}
}));
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
passport.use(codefunPassport);
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

// Declare global constants
try {
	const version = fs.readFileSync('twi.version', 'utf-8');
	app.use((req, res, next) => {
		res.locals.TWIVersion = version;
		next();
	});
} catch (e) {
	app.use((req, res, next) => {
		res.locals.TWIVersion = (process.env.npm_package_version ? `v${process.env.npm_package_version} (git)` : 'unknown version');
		next();
	});
}

// Routes
app.use('/', require('./routes/index'));

app.use((req, res, next) => {
	let err = new Error('Không tìm thấy trang');
	err.status = 404;
	next(err);
});

// Error handlers

// A special error handler for the user deserialization failure.
app.use((err, req, res, next) => {
	if (err === codefunPassport.deserializeFail) {
		req.logout(); // Immediately logs the user out.
		debug('themis:controls:user')('Failed to identify previously logged on user, logged out. Did you change the accounts file?');
		return res.redirect('/');
	}
	// If not the error, simply pass.
	next(err);
});

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

if (process.env.NODE_ENV === 'production') {
	// checks for a new version
	axios.get('https://api.github.com/repos/natsukagami/themis-web-interface/releases')
	.then(response => {
		if (response.status !== 200) return httpServer.debug('Failed to check for new version: Response status ' + response.status);
		const versions = response.data;
		if (versions[0].tag_name !== fs.readFileSync('twi.version', 'utf-8')) {
			httpServer.debug('New version available: ' + versions[0].name + ', please download at ' + versions[0].assets[0].browser_download_url);
		}
	})
	.catch(err => {
		httpServer.debug('Failed to check for new version: ' + err);
	});
}

httpServer.listen(PORT);
