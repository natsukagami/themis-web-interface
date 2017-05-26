const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const debug = require('debug')('themis:router:submit');
const Log = require('../controls/judgelog');
const UserLog = require('../controls/userlog');
const Config = require('../config');

const submitPath = path.join(process.cwd(), 'data', 'submit');

if (Config.rateLimiter && Config.rateLimiter.submit !== null) {
	debug('Rate limiter enabled.');
	const rateLimiter = require('../controls/rate-limiter')(Config.rateLimiter.submit);
	router.post('/', rateLimiter.prevent);
}


router.use((req, res, next) => {
	// If contest mode is enabled and contest hasn't started, do not allow submitting.
	if (global.Config.contestMode.enabled) {
		if (global.Config.contestMode.startTime > new Date()) {
			return res.json('Cuộc thi chưa bắt đầu!');
		}
		// Don't allow when contest time's over.
		if (global.Config.contestMode.endTime < new Date()) {
			return res.json('Cuộc thi đã kết thúc!');
		}
	}

	next();
});

router.post('/', (req, res, next) => {
	if (!req.user) {
		let err = new Error('You have to login first');
		err.code = 403;
		return next(err);
	}
	let q = req.body;
	if (!q.problem || !q.ext || !q.content) {
		return next(new Error('Invalid request'));
	}
	q.ext = q.ext.toLowerCase();
	q.problem = q.problem.toUpperCase();
	// Clean logs before writing
	Log.setLog(req.user.username, q.problem, q.ext, {
		created: new Date(),
		content: {
			verdict: '',
			details: []
		}
	});
	UserLog.addScore(req.user.username, q.problem, { });
	UserLog.addSubmit(req.user.username, `0[${req.user.username}][${q.problem}]${q.ext}`, q.content);
	fs.writeFile(path.join(submitPath, `0[${req.user.username}][${q.problem}]${q.ext}`), q.content, err => {
		if (err) return next(err);
		res.json(true);
	});
});

module.exports = router;
