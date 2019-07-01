import Submission from '../../controls/submission'
import RootAction from '../actions'

type Action = RootAction

export default function reduceLog (
  l: Submission['result'],
  action: Action
): Submission['result'] {
  switch (action.type) {
    case 'LOG_SUCCESS':
      return action.payload.log
    case 'LOG_FAILURE':
      console.log(action.payload.err)
      return l
    default:
      return l
  }
}
