import { createStandardAction, createAsyncAction } from 'typesafe-actions'
import { IndexedAction } from './submissions'
import Err from './err'

/**
 * Edits the current submission. Accepts the new content.
 */
export const editSubmission = createStandardAction('EDIT_SUBMISSION')<
  IndexedAction & { content: string }
>()

/**
 * Submits the submission and its outcomes.
 */
export const submit = createAsyncAction(
  'SUBMIT_REQUEST',
  'SUBMIT_SUCCESS',
  'SUBMIT_FAILURE'
)<IndexedAction, IndexedAction, IndexedAction & Err>()
