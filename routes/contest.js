const express = require('express');
const router = express.Router();

if (global.Config.contestMode.enabled) {
	if (global.Config.contestMode.startTime > global.Config.contestMode.endTime) {
		throw (new Error('Invalid contest time! Start time should be earlier than end time!'));
	}
	require('debug')('themis:server')('Contest mode enabled.');
	router.get('/', (req, res) => {
		res.json({
			startTime: global.Config.contestMode.startTime,
			endTime: global.Config.contestMode.endTime
		});
	});
}

module.exports = router;