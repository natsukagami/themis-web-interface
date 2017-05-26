const express = require('express');
const router = express.Router();
const Scoring = require('../controls/scoring');

router.use((req, res, next) => {
	if (global.Config.allowScoreboard) return next();
	let x = new Error('Page not found'); x.status = 404;
	next(x);
});

router.use((req, res, next) => {
	const scoreboard = Object.keys(Scoring.scores).map(key => Object.assign({}, Scoring.scores[key], { name: key }));
	const problems = [];
	for (let u of scoreboard) {
		for (let p of Object.keys(u)) {
			if (p === 'name' || p === 'total') continue;
			if (problems.indexOf(p) === -1) problems.push(p);
		}
	}
	problems.sort();
	scoreboard.sort((a, b) => {
		return b.total - a.total;
	});
	for (let i = 0; i < scoreboard.length; ++i) {
		const u = scoreboard[i];
		if (i > 0 && u.total === scoreboard[i - 1].total)
			u.rank = scoreboard[i - 1].rank;
		else u.rank = i + 1;
	}
	res.locals.scoreboard = scoreboard;
	res.locals.problems = problems;
	next();
});

router.get('/', (req, res) => {
	return res.render('scoreboard', {
		title: 'Bảng xếp hạng'
	});
});

router.post('/', (req, res) => {
	return res.json({
		problems: res.locals.problems,
		contestants: res.locals.scoreboard
	});
});

module.exports = router;
