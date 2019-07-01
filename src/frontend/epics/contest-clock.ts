import { Epic } from 'redux-observable'
import RootAction from '../actions'
import { RootState } from '../reducers'
import { isActionOf, ActionType } from 'typesafe-actions'
import { contestClock } from '../actions/contest-clock'
import { filter, switchMap, map, catchError } from 'rxjs/internal/operators'
import { Observable, of } from 'rxjs'
import { get } from './fetch'

type Action = RootAction

const contestClockEpic: Epic<Action, Action, RootState> = (actions$, state$) =>
  actions$.pipe(
    filter(isActionOf(contestClock.request)),
    switchMap(contestClockFn)
  )
export default contestClockEpic

function contestClockFn (
  action: ActionType<typeof contestClock.request>
): Observable<Action> {
  return get<{ startTime: Date; endTime: Date } | null>('/contest').pipe(
    map(
      // Transform into startTime/endTime Date struct
      v =>
        v === null
          ? null
          : {
            startTime: new Date(v.startTime),
            endTime: new Date(v.endTime)
          }
    ),
    map(v => contestClock.success(v)),
    catchError(err => of(contestClock.failure(err)))
  )
}
