import { createAsyncAction, createStandardAction } from 'typesafe-actions'
import { IndexedAction } from './submissions'
import Submission from '../../controls/submission'
import Err from './err'

/**
 * Starts requesting logs and receiving them
 */
export const log = createAsyncAction(
  'LOG_REQUEST',
  'LOG_SUCCESS',
  'LOG_FAILURE'
)<
  IndexedAction,
  IndexedAction & {
    log: Submission['result'];
  },
  IndexedAction & Err
>()
