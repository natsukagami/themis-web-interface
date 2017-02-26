module.exports = {
	contestName: 'Trình chấm Themis',
	port: 80,
	sessionSecret: 'gisjWikvZWHMiQzNmTV7',
	allowScoreboard: true,
	registration: {
		allow: false,
		recaptcha: {
			enable: true,
			siteKey: '',
			secretKey: ''
		}
	},
	contestMode: {
		enabled: false,
		// Month is 0 based (0 = January)
		startTime: new Date(2015, 12, 31, 23, 59, 59),
		endTime: new Date(2016, 12, 31, 23, 59, 59),
		// Hide judge logs until contest ends
		hideLogs: true
	}
};
