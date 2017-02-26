const express = require('express');
const router = express.Router();
const walk = require('walk');
const path = require('path');
const md5 = require('md5');

const filesPath = path.join(process.cwd(), 'data', 'files');

let fileList = {};

(function rescanFileList() {
	const nwList = {};
	const w = walk.walk(filesPath);
	w.on('file', (root, stats, next) => {
		if (stats.name === 'readme.md') return next(); // Skip this file
		const filePath = path.join(path.relative(filesPath, root), stats.name);
		nwList[md5(filePath)] = filePath;
		next();
	});
	w.on('end', () => {
		fileList = nwList;
		setTimeout(rescanFileList, 5000);
	});
})();

router.get('/', (req, res) => {
	return res.json(fileList);
});

router.use((req, res, next) => {
	// If contest mode is enabled and contest hasn't started, do not serve files.
	if (global.Config.contestMode.enabled && global.Config.contestMode.startTime > new Date())
		return next(new Error('Cuộc thi chưa bắt đầu!'));
	next();
});

router.param('id', (req, res, next, id) => {
	if (!(id in fileList)) {
		return next(new Error('Invalid request'));
	}
	req.file = fileList[id];
	next();
});

router.get('/:id', (req, res) => {
	return res.download(path.join(filesPath, req.file));
});

module.exports = router;
