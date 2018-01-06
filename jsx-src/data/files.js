import {
	setInterval
} from 'timers';
import {
	combineReducers
} from 'redux';

const FILES = 'FILES';
const UPDATE = FILES + '_UPDATE';
const REFRESH = FILES + '_REFRESH';
const axios = require('axios');

/**
 * Refreshes the file list from the server.
 */
export function refresh() {
	return (dispatch, getState) => {
		if (new Date() - getState().files.lastRefreshed < 1000) {
			// Less than one second has passed
			return;
		}
		// Refresh so that this function can't be called in another second
		dispatch({
			type: REFRESH
		});
		axios.get('/files')
			.then(response => {
				if (response.status !== 200) return;
				// Dispatch any change on reload
				dispatch({
					type: UPDATE,
					payload: response.data
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
	files: reduceFiles,
	lastRefreshed: reduceRefresh
});

/**
 * Reduces the files list.
 * @param {{[string]: any}} files 
 * @param {any} action 
 * @returns {{[string]: any}}
 */
function reduceFiles(files = {}, action) {
	if (action.type === UPDATE) {
		return action.payload;
	}
	return files;
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