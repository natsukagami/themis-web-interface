import { createAsyncAction } from 'typesafe-actions'
import Err from './err'

/**
 * Fetch the number of items in queue
 */
const queue = createAsyncAction(
  'QUEUE_REQUEST',
  'QUEUE_SUCCESS',
  'QUEUE_FAILURE'
)<void, number, Err>()
export default queue
