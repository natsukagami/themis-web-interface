const express = require('express');
const router = express.Router();

router.use('/scoreboard', require('./scoreboard'));

router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/log', require('./log'));

router.use((req, res, next) => {
	if (!req.user)
		return res.redirect('/login');
	res.locals.user = req.user;
	next();
});

router.use('/contest', require('./contest'));
router.use('/submit', require('./submit'));
router.use('/queue', require('./queue'));
router.use('/files', require('./files'));
router.use('/change-password', require('./changePassword'));

router.get('/logout', (req, res) => {
	req.logout();
	return res.redirect('/');
});

router.get('/', (req, res) => {
	res.render('index', {
		title: 'Trang chủ'
	});
});

module.exports = router;
