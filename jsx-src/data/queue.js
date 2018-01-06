import {
	setInterval
} from 'timers';
import {
	combineReducers
} from 'redux';

const QUEUE = 'QUEUE';
const UPDATE = QUEUE + '_UPDATE';
const REFRESH = QUEUE + '_REFRESH';
const axios = require('axios');

/**
 * Refreshes the file list from the server.
 */
export function refresh() {
	return (dispatch, getState) => {
		if (new Date() - getState().queue.lastRefreshed < 1000) {
			// Less than one second has passed
			return;
		}
		// Refresh so that this function can't be called in another second
		dispatch({
			type: REFRESH
		});
		axios.post('/queue')
			.then(response => {
				if (response.status !== 200) return;
				const res = Number(response.data);
				if (isNaN(res)) {
					return; // Invalid response.
				}
				// Dispatch any change on reload
				dispatch({
					type: UPDATE,
					payload: res
				});
			})
			.catch(() => { // Pass error
			});
	}
}

/**
 * The reload clock.
 * @type {NodeJS.Timer | null}
 */
let clock = null;

/**
 * Loads the reload clock
 */
export function load() {
	return (dispatch, getState) => {
		if (clock === null) {
			clock = setInterval(() => dispatch(refresh), 15000); // Every 15 seconds
		}
	}
}

export default combineReducers({
	count: reduceQueue,
	lastRefreshed: reduceRefresh
});

/**
 * Reduces the files list.
 * @param {Number} queue
 * @param {any} action 
 * @returns {Number}
 */
function reduceQueue(queue = 0, action) {
	if (action.type === UPDATE) {
		return action.payload;
	}
	return queue;
}

/**
 * Reduces the last refresh date.
 * @param {Date} last 
 * @param {any} action 
 * @returns {Date}
 */
function reduceRefresh(last = new Date(0), action) {
	if (action.type === REFRESH) {
		return new Date();
	}
	return last;
}