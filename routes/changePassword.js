const express = require('express');
const router = express.Router();
const md5 = require('md5');

router.get('/', (req, res) => {
	res.render('changePassword', {
		title: 'Đổi mật khẩu'
	});
});

router.post('/', (req, res, next) => {
	const q = req.body;
	if (!q.oldPassword || !q.password || !q.retype) {
		return next(new Error('Invalid request'));
	}
	if (md5(q.oldPassword) !== req.user.password) {
		return next(new Error('Mật khẩu không chính xác!'));
	}
	if (q.password !== q.retype) {
		return next(new Error('Mật khẩu không trùng nhau!'));
	}
	req.user.password = md5(q.password);
	req.user.save(() => {
		res.redirect('/');
	});
});

module.exports = router;
