const Promise = require('bluebird');
const express = require('express');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));
const router = express.Router();

const submitPath = path.join(process.cwd(), 'data', 'submit')

// Implements a periodic counter.
const counter = function() {
	fs.readdir(submitPath, 'utf8', (err, files) => {
		if (err) return;
		Promise.all(files.filter(file => file !== 'readme.md').map(item => fs.statAsync(path.join(submitPath, item))))
		.then(stats => {
			counter.count = stats.filter(stat => stat.isFile()).length;
		});
	});
};
counter();
setInterval(counter, 5000); // Every 5 secs

router.post('/', (req, res) => {
	res.json(counter.count);
});

module.exports = router;
