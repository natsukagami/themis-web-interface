const express = require('express');
const router = express.Router();
const debug = require('debug')('themis:router:register');
const User = require('../controls/user');

router.use((req, res, next) => {
	// Disable the router if registration is disabled
	if (!global.Config.registration.allow) {
		const x = new Error('Page not found');
		x.status = 404; return next(x);
	}
	next();
});

let recaptcha = null;

if (global.Config.registration.recaptcha.enable) {
	recaptcha = require('express-recaptcha');
	recaptcha.init(global.Config.registration.recaptcha.siteKey, global.Config.registration.recaptcha.secretKey);
} else if (global.Config.registration.allow) {
	debug('WARNING: Disabling ReCaptcha while allowing registration can put your server in danger of DoS!');
}

router.use((req, res, next) => {
	// Redirect to home page if already logged in
	if (!req.user) return next();
	return res.redirect('/');
});

if (recaptcha) {
	router.get('/', recaptcha.middleware.render);
	router.post('/', recaptcha.middleware.verify);
}

router.get('/', (req, res) => {
	res.render('register', {
		title: 'Đăng kí',
		recaptcha: req.recaptcha || '',
		recaptchaFailed: req.query['recaptcha-failed'] === 'true',
		userExists: req.query['user-exists'] === 'true'
	});
});

router.post('/', (req, res, next) => {
	if (recaptcha && req.recaptcha.error) {
		return res.redirect('/register?recaptcha-failed=true');
	}
	const q = req.body;
	if (!q.username || !q.password || !q.name) {
		return next(new Error('Invalid request'));
	}
	User.add(q, err => {
		if (err) return res.redirect('/register?user-exists=true');
		return res.redirect('/login?register-successful=true');
	});
});

module.exports = router;
