// This file implements the root of data for Redux.

import {
	combineReducers
} from 'redux';

// Contest information
import contest from './contest';
// Downloadable file list

export default combineReducers({
	contest
});