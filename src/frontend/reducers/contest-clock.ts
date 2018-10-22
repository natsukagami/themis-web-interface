import { Reducer } from 'redux'
import RootAction from '../actions'

type Action = RootAction

type ContestClock = {
  startTime: Date;
  endTime: Date;
} | null

const reduceContestClock: Reducer<ContestClock, Action> = (
  c = null,
  action
) => {
  switch (action.type) {
    case 'CONTEST_SUCCESS':
      return action.payload
    case 'CONTEST_FAILURE':
      console.log(
        'Contest clock failed to fetch: ' + action.payload.err.message
      )
      return c
  }
  return c
}
export default reduceContestClock
