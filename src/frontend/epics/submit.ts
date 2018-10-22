import { Epic, combineEpics } from 'redux-observable'
import RootAction from '../actions'
import { RootState } from '../reducers'
import { filter, mergeMap, map, catchError } from 'rxjs/internal/operators'
import { isActionOf, ActionType } from 'typesafe-actions'
import { submit } from '../actions/submission'
import { Observable, of } from 'rxjs'
import { post } from './fetch'
import { filenameOf, extTable } from '../../controls/submission'
import { log } from '../actions/log'

const submitEpic: Epic<RootAction, RootAction, RootState> = (
  actions$,
  state$
) =>
  actions$.pipe(
    filter(isActionOf(submit.request)),
    mergeMap(action => submitFn(action, state$.value))
  )

/**
 * Upon successful submission, emit log request
 */
const requestLogOnSubmitted: Epic<
  RootAction,
  RootAction,
  RootState
> = actions$ =>
  actions$.pipe(
    filter(isActionOf(submit.success)),
    map(action => log.request(action.payload))
  )
export default combineEpics(submitEpic, requestLogOnSubmitted)

function submitFn (
  action: ActionType<typeof submit.request>,
  state: RootState
): Observable<RootAction> {
  const sub = state.submissions.list.find(
    v => filenameOf(v) === action.payload.filename
  )
  if (!sub) return of() // Should not happen but...

  return post<true>('/submit', {
    problem: sub.filename,
    ext: '.' + extTable[sub.lang],
    content: sub.content
  }).pipe(
    map(() => submit.success(action.payload)),
    catchError(err => of(submit.failure({ ...action.payload, err })))
  )
}
