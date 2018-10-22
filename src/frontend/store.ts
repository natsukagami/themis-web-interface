import { createStore, applyMiddleware, compose } from 'redux'
import reducer, { RootState } from './reducers'
import RootAction from './actions'
import { createEpicMiddleware } from 'redux-observable'
import rootEpic from './epics'
import { files } from './actions/files'
import { contestClock } from './actions/contest-clock'
import { log } from './actions/log'
import { filenameOf } from '../controls/submission'

const versionPrefix = '_v0.4'

const epicMiddleware = createEpicMiddleware<
  RootAction,
  RootAction,
  RootState
>()

const composeEnhancers: typeof compose =
  process.env.NODE_ENV === 'development'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose

const store = createStore(
  reducer,
  transformLocalState(
    JSON.parse(localStorage.getItem(window.username + versionPrefix) || '{}')
  ),
  composeEnhancers(applyMiddleware(epicMiddleware))
)
export default store

epicMiddleware.run(rootEpic)

/**
 * Integrate with localStorage
 */
store.subscribe(() => {
  localStorage.setItem(
    window.username + versionPrefix,
    JSON.stringify(store.getState())
  )
})

/**
 * Launch the contest clock and file update service
 */
function setIntAndRun (f: () => void, interval: number) {
  f()
  return setInterval(f, interval)
}

setIntAndRun(() => store.dispatch(files.request()), 60 * 1000)
setIntAndRun(() => store.dispatch(contestClock.request()), 60 * 1000)

/** Do a transformation on the saved local state */
function transformLocalState (
  state: {} | RootState['submissions']
): {} | Pick<RootState, 'submissions'> {
  if (!('list' in state)) return {}

  // "un-submit" all 'submitting' submissions
  state.list = state.list.map(s => {
    if (s.saveStatus === 'submitting') s.saveStatus = 'saved'
    return s
  })

  return state
}

// After the store has been established, fire log requests for all submitted submissions without a log.
(function () {
  const state = store.getState()

  for (const s of state.submissions.list) {
    if (s.saveStatus === 'submitted' && s.result === undefined) {
      store.dispatch(log.request({ filename: filenameOf(s) }))
    }
  }
})()
