import { createAsyncAction } from 'typesafe-actions'
import Err from './err'

export const contestClock = createAsyncAction(
  'CONTEST_REQUEST',
  'CONTEST_SUCCESS',
  'CONTEST_FAILURE'
)<
  void,
  {
    startTime: Date;
    endTime: Date;
  } | null,
  Err
>()
