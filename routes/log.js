const express = require('express');
const router = express.Router();
const debug = require('debug')('themis:router:log');
const JudgeLog = require('../controls/judgelog');
const Config = require('../config');

if (Config.rateLimiter && Config.rateLimiter.logRequest !== null) {
	debug('Rate limiter enabled.');
	const rateLimiter = require('../controls/rate-limiter')(Config.rateLimiter.logRequest);
	router.post('/', rateLimiter.prevent);
}

router.post('/', (req, res, next) => {
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
