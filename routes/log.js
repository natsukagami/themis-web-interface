const express = require('express');
const router = express.Router();
const JudgeLog = require('../controls/judgelog');

router.post('/', (req, res, next) => {
	let q = req.body;
	if (!q.user || !q.problem || !q.ext)
		return next(new Error('Invalid request '));
	JudgeLog(q.user, q.problem, q.ext, log => {
		if (log === null) return res.json(log);
		return res.json(log);
	});
});

module.exports = router;
