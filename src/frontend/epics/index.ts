import { combineEpics } from 'redux-observable'
import logEpic from './log'
import submitEpic from './submit'
import filesEpic from './files'
import queueEpic from './queue'
import contestClockEpic from './contest-clock'

const rootEpic = combineEpics(
  logEpic,
  submitEpic,
  filesEpic,
  queueEpic,
  contestClockEpic
)
export default rootEpic
