import RootAction from '../actions'
import notify from '../notifications'

interface Queue {
  items: number
  status: 'done' | 'loading'
}

/**
 * Reduces the number of items in queue
 */
export default function reduceQueue (
  q: Queue = { items: 0, status: 'done' },
  action: RootAction
): Queue {
  switch (action.type) {
    case 'QUEUE_REQUEST':
      return { ...q, status: 'loading' }
    case 'QUEUE_SUCCESS':
      return { items: action.payload, status: 'done' }
    case 'QUEUE_FAILURE':
      console.log('Queue fetch failed: ' + action.payload.err.message)
      return { ...q, status: 'done' }
  }
  return q
}
