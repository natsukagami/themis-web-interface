const CONTEST = 'CONTEST';
const NOW = CONTEST + '_NOW';
const INFO = CONTEST + '_INFO';
const axios = require('axios');

function nowClock(dispatch) {
	// Registers a clock that fires a 'now' update every second.
	setInterval(() => dispatch({
		type: NOW
	}), 1000);
}

function fetchContest(dispatch) {
	// Fetches the contest and dispatches an update.
	axios.get('/contest')
		.then(response => {
			if (response.status !== 200) return;
			dispatch({
				type: INFO,
				payload: {
					startTime: new Date(response.data.startTime),
					endTime: new Date(response.data.endTime)
				}
			});
		})
		.catch(() => {});
}

/**
 * Loads the contest.
 * Returns a redux action.
 */
export function loadContest() {
	return (dispatch, getState) => {
		console.log('!');
		fetchContest(dispatch);
		nowClock(dispatch);
	}
}

export default function reduceContest(contest = {
	info: null,
	now: new Date(),
}, action) {
	if (action.type === NOW) {
		return { ...contest,
			now: new Date()
		};
	}
	if (action.type === INFO) {
		return { ...contest,
			info: action.payload
		};
	}
	return contest;
}