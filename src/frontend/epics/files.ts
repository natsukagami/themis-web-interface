import { Epic } from 'redux-observable'
import RootAction from '../actions'
import { RootState } from '../reducers'
import { isActionOf, ActionType } from 'typesafe-actions'
import { files } from '../actions/files'
import { filter, switchMap, map, catchError } from 'rxjs/internal/operators'
import { Observable, of } from 'rxjs'
import { get } from './fetch'

type Action = RootAction

const filesEpic: Epic<Action, Action, RootState> = (actions$, state$) =>
  actions$.pipe(
    filter(isActionOf(files.request)),
    switchMap(filesFn)
  )
export default filesEpic

function filesFn (action: ActionType<typeof files.request>): Observable<Action> {
  return get<{ [hash: string]: string }>('/files').pipe(
    map(v => files.success(v)),
    catchError(err => of(files.failure({ err })))
  )
}
