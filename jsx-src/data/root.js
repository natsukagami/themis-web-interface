// This file implements the root of data for Redux.

import {
	combineReducers
} from 'redux';

// Contest information
import contest from './contest';
// Downloadable file list
import files from './files';

export default combineReducers({
	contest,
	files
});