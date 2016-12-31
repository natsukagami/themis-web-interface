const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('login', {
		title: 'Đăng nhập'
	});
});

router.post('/', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

module.exports = router;
