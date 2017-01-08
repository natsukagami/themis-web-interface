const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use((req, res, next) => {
	if (!req.user) return next();
	return res.redirect('/');
});

router.get('/', (req, res) => {
	res.render('login', {
		title: 'Đăng nhập',
		failed: req.query.failed === 'true',
		registerSuccessful: req.query['register-successful'] === 'true'
	});
});

router.post('/', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?failed=true'
}));

module.exports = router;
