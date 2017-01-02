const debug = require('debug')('themis:scoring');

const scores = { };

function addScore(user, problem, verdict) {
	const score = (isNaN(Number(verdict)) ? 0 : Number(verdict));
	if (!scores[user]) scores[user] = { total: 0 };
	if (!scores[user][problem]) scores[user][problem] = 0;
	scores[user].total += score - scores[user][problem];
	scores[user][problem] = score;
	debug(`New score ${score} for ${user} on ${problem}`);
}

module.exports = {
	add: addScore,
	scores: scores
};
