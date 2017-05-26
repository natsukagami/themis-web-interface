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
	},
	// Config the rate-limiter
	rateLimiter: {
		// every limiter has 4 parameters:
		// - free tries: The number of request that can be assigned within the time window without any wait.
		// - min wait: The minimum wait time between 2 limited requests. (in seconds)
		// - max wait: The maximum wait time between 2 limited requests.
		// - life time: The lifetime of a logged request.
		// For each site, set the rate limiter value to an array of 4 numbers to activathe the rate limiter,
		// or set to null to disable it.
		// For example, the previously used config:
		// submit: [30, 2 * 60 * 60, 2 * 60 * 60, 60 * 60],
		// register: [30, 25 * 60 * 60, 25 * 60 * 60, 24 * 60 * 60],
		// logRequest: [2400, 2 * 60 * 60, 2 * 60 * 60, 60 * 60]
		submit: null,
		register: null,
		logRequest: null
	}
};
