/**
 * At heart, all data saved in this application is nearly just a list of submissions.
 */
import CSubmission, {
  ISubmission as Submission,
  extTable,
  filenameOf
} from '../../controls/submission'
import { Reducer } from 'redux'
import reduceLog from './log'
import RootAction from '../actions'
import notify from '../notifications'

type Action = RootAction

export interface Submissions {
  list: Submission[]
  selected: number | null
}

const reduceSubmissions: Reducer<Submissions, Action> = (
  s: Submissions = { list: [], selected: null },
  action: Action
): Submissions => {
  if (action.type === 'ADD_SUBMISSION') {
    const newSub = new CSubmission(action.payload)
    const index = s.list.findIndex(s => filenameOf(s) === filenameOf(newSub))
    if (index !== -1) {
      return { ...s, selected: index } // The thing already existed
    }
    return {
      ...s,
      list: [...s.list, newSub],
      selected: s.list.length
    }
  }
  if (action.type === 'SELECT_SUBMISSION') {
    return {
      ...s,
      selected: s.list.findIndex(v => filenameOf(v) === action.payload.filename)
    }
  }
  // An action to a specific file
  if (
    'payload' in action &&
    action.payload &&
    typeof action.payload !== 'number' &&
    action.payload !== null &&
    'filename' in action.payload
  ) {
    const res = {
      ...s,
      list: applyArray(s.list, action.payload.filename, action)
    }
    if (res.selected !== null && res.selected >= res.list.length) {
      // the "selected" pointer should decrease, provided it was correct
      res.selected = res.list.length === 0 ? null : res.selected - 1
    }
    return res
  }
  return s
}
export default reduceSubmissions

/**
 * Reduce a submission. Notice that it has to be existent first, because all actions should be modifying an existing submission.
 * Also, sometimes it is possible for the submission to be deleted.
 */
function reduceSubmission (
  s: Submission,
  action: Action
): Submission | undefined {
  switch (action.type) {
    case 'REMOVE_SUBMISSION':
      return undefined
    case 'EDIT_SUBMISSION':
      return {
        ...s,
        content: action.payload.content,
        saveStatus: 'saved',
        result: undefined
      }
    case 'SUBMIT_REQUEST':
      return { ...s, saveStatus: 'submitting' }
    case 'SUBMIT_SUCCESS':
      return { ...s, saveStatus: 'submitted' }
    case 'SUBMIT_FAILURE':
      // Show a notification
      notify(
        `File ${s.filename} failed to submit`,
        `An error has occured: ${action.payload.err.message}`
      )
      return { ...s, saveStatus: 'saved' }
  }

  // Outside the switch, it could be possible that the log is being modified.
  const log = reduceLog(s.result, action)
  // Create a new submission if log was changed
  return log !== s.result ? { ...s, result: log } : s
}

/**
 * Applies the reduction to a particular element in the array.
 */
function applyArray (
  arr: Submission[],
  filename: string,
  action: Action
): Submission[] {
  const index = arr.findIndex(v => filename === filenameOf(v))
  // If the index is outside of the array, just return the old one
  if (arr[index] === undefined) return arr

  const newPos = reduceSubmission(arr[index], action)

  // Return a new array if the value changed
  if (newPos !== arr[index]) {
    const newArr = arr.slice()
    // Deleted
    if (newPos === undefined) newArr.splice(index, 1)
    else newArr[index] = newPos
    return newArr
  }
  return arr
}
