import { Observable, from, interval } from 'rxjs'
import Axios from 'axios'
import { map, switchMap, takeUntil } from 'rxjs/internal/operators'

export function get<T> (url: string): Observable<T> {
  return from(
    Axios.get<T>(url, { withCredentials: true }).then(res => {
      if (res.status !== 200) {
        return Promise.reject<T>(new Error(res.statusText))
      }
      return res.data
    })
  )
}

export function post<T> (url: string, data: any = {}): Observable<T> {
  return from(
    Axios.post<T>(url, data, { withCredentials: true }).then(res => {
      if (res.status !== 200) {
        return Promise.reject<T>(new Error(res.statusText))
      }
      return res.data
    })
  )
}

export function repeat<T> (
  fn: () => Observable<T>,
  time: number,
  until: Parameters<typeof takeUntil>[0]
): Observable<T> {
  return interval(time).pipe(
    takeUntil(until),
    switchMap(fn)
  )
}
