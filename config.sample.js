//true: Bật, false: Tắt
module.exports = {
	contestName: 'Trang chủ',//Tên contest
	port: 80,
	sessionSecret: 'gisjWikvZWHMiQzNmTV7',
	allowScoreboard: true,//Hiện bảng điểm (Lưu ý: Tắt bảng điểm khi bật chế độ contest)
	registration: {
		allow: true,//Cho phép đăng kí
		recaptcha: {
			enable: false,//Tích hợp Capcha để chống tấn cống DDOS
			siteKey: '',
			secretKey: ''
		}
	},
	contestMode: {
		enabled: false,//Bật hoặc tắt chế độ contest (Lưu ý: Tắt bảng điểm khi bật chế độ contest)
		// Định dạng (YYYY, MM, DD, HH, MM, SS)
		// Month is 0 based (0 = January)
		// Tháng bắt đầu tính từ 0
		startTime: new Date(2017, 7, 24, 19, 07, 00),
		endTime: new Date(2017, 7, 24, 20, 50, 00),
		// Hide judge logs until contest ends
		hideLogs: true //Ẩn kết quả chấm cho đến cuối contest
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
