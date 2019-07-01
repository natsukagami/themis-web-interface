import { Epic } from 'redux-observable'
import RootAction from '../actions'
import { RootState } from '../reducers'
import { isActionOf, ActionType } from 'typesafe-actions'
import queue from '../actions/queue'
import { filter, switchMap, map, catchError } from 'rxjs/internal/operators'
import { Observable, of } from 'rxjs'
import { post } from './fetch'

type Action = RootAction

const queueEpic: Epic<Action, Action, RootState> = (actions$, state$) =>
  actions$.pipe(
    filter(isActionOf(queue.request)),
    switchMap(queueFn)
  )
export default queueEpic

function queueFn (action: ActionType<typeof queue.request>): Observable<Action> {
  return post<number>('/queue').pipe(
    map(v => queue.success(v)),
    catchError(err => of(queue.failure({ err })))
  )
}
