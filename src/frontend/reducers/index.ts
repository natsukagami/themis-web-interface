import { combineReducers } from 'redux'
import reduceSubmissions from './submission'
import reduceFiles from './files'
import reduceAddForms from './add-forms'
import reduceQueue from './queue'
import reduceContestClock from './contest-clock'

/**
 * The root reducer
 */
const reducer = combineReducers({
  submissions: reduceSubmissions,
  files: reduceFiles,
  addForms: reduceAddForms,
  queue: reduceQueue,
  contestClock: reduceContestClock
})
export default reducer

export type RootState = ReturnType<typeof reducer>
