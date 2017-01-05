const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('login', {
		title: 'Đăng nhập',
		failed: req.query.failed === 'true'
	});
});

router.post('/', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?failed=true'
}));

module.exports = router;
