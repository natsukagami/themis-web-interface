import { createAsyncAction } from 'typesafe-actions'
import Err from './err'

/**
 * Requesting and receiving file lists
 */
export const files = createAsyncAction(
  'FILES_REQUEST',
  'FILES_SUCCESS',
  'FILES_FAILURE'
)<void, { [hash: string]: string }, Err>()
