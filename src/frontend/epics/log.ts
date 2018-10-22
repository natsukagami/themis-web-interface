import { Epic } from 'redux-observable'
import RootAction from '../actions'
import { RootState } from '../reducers'
import {
  filter,
  switchMap,
  mergeMap,
  groupBy,
  map,
  catchError,
  takeUntil
} from 'rxjs/internal/operators'
import { isActionOf, ActionType } from 'typesafe-actions'
import { log } from '../actions/log'
import { post, repeat } from './fetch'
import { basename, extname } from 'path'
import { LogContent, Log } from '../../controls/judgelog'
import { Observable, of } from 'rxjs'

const logEpic: Epic<RootAction, RootAction, RootState> = actions$ =>
  actions$.pipe(
    filter(isActionOf(log.request)),
    groupBy(value => value.payload.filename),
    mergeMap(actions => actions.pipe(switchMap(a => fetchLog(a, actions$))))
  )
export default logEpic

function fetchLog (
  action: ActionType<typeof log.request>,
  actions$: Observable<RootAction>
): Observable<RootAction> {
  return repeat(
    () =>
      post<Log | null>('/log', {
        user: window.username,
        problem: basename(
          action.payload.filename,
          extname(action.payload.filename)
        ),
        ext: extname(action.payload.filename)
      }),
    5000,
    actions$.pipe(filter(a => isLogCancel(a, action.payload.filename)))
  ).pipe(
    map(v =>
      log.success({
        ...action.payload,
        log: v === null ? undefined : v.content
      })
    ),
    catchError(err => of(log.failure({ ...action.payload, err })))
  )
}

/**
 * When can an action be defined as "cancelling?"
 */
function isLogCancel (a: RootAction, filename: string | true = true): boolean {
  if (
    (a.type === 'EDIT_SUBMISSION' ||
      a.type === 'REMOVE_SUBMISSION' ||
      a.type === 'SUBMIT_REQUEST') &&
    a.payload.filename === filename
  ) {
    return true
  }
  if (
    a.type === 'LOG_SUCCESS' &&
    (filename === true || a.payload.filename === filename) &&
    a.payload.log !== undefined
  ) {
    return true
  }
  return false
}
