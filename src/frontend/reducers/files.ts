import RootAction from '../actions'
import { Reducer } from 'redux'

type Action = RootAction

interface Files {
  list: { [hash: string]: string }
  status: 'loading' | 'done'
}

/**
 * Reduce files list.
 */
const reduceFiles: Reducer<Files, Action> = (
  s = { list: {}, status: 'done' },
  action
) => {
  switch (action.type) {
    case 'FILES_REQUEST':
      return { ...s, status: 'loading' }
    case 'FILES_SUCCESS':
      return { ...s, list: action.payload, status: 'done' }
    case 'FILES_FAILURE':
      console.log('Files list fetching failed: ' + action.payload.err.message)
  }
  return s
}
export default reduceFiles
