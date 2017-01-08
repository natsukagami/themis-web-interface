const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Log = require('../controls/judgelog');
const UserLog = require('../controls/userlog');

const submitPath = path.join(process.cwd(), 'data', 'submit');

const rateLimiter = require('../controls/rate-limiter')({
	// Allow 3 submits, then slows down
	freeRetries: 30,
	minWait: 2 * 60 * 60,
	maxWait: 2 * 60 * 60,
	lifetime: 60 * 60
});

router.post('/', rateLimiter.prevent, (req, res, next) => {
	if (!req.user) {
		let err = new Error('You have to login first');
		err.code = 403;
		return next(err);
	}
	let q = req.body;
	if (!q.problem || !q.ext || !q.content) {
		return next(new Error('Invalid request'));
	}
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
