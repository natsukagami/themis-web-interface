const express = require('express');
const router = express.Router();
const JudgeLog = require('../controls/judgelog');

const rateLimiter = require('../controls/rate-limiter')({
	// Allow 2400 (really high) requests per hour
	freeRetries: 2400,
	minWait: 2 * 60 * 60,
	maxWait: 2 * 60 * 60,
	lifetime: 60 * 60
});

router.post('/', rateLimiter.prevent, (req, res, next) => {
	let q = req.body;
	if (!q.user || !q.problem || !q.ext)
		return next(new Error('Invalid request '));
	JudgeLog(q.user, q.problem, q.ext, log => {
		if (log === null || log.content.verdict === '' || isNaN(Number(log.content.verdict))) return res.json(log);
		if (global.Config.contestMode.enabled && global.Config.contestMode.hideLogs && global.Config.contestMode.endTime > new Date())
			return res.json(Object.assign({}, log, { content: { verdict: 'Yes', details: [] }})); // Yes = Judged but log is hidden	
		return res.json(log);
	});
});

module.exports = router;
