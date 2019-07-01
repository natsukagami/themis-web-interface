import { createStandardAction } from 'typesafe-actions'
import { Lang } from '../../controls/submission'

export interface IndexedAction {
  filename: string
}

/**
 * Select a submission
 */
export const selectSubmission = createStandardAction('SELECT_SUBMISSION')<
  IndexedAction
>()

/**
 * Adds a new submission
 */
export const addSubmission = createStandardAction('ADD_SUBMISSION')<{
  filename: string;
  lang: Lang;
  content?: string;
}>()

/**
 * Removes an indexed submission
 */
export const removeSubmission = createStandardAction('REMOVE_SUBMISSION')<
  IndexedAction
>()
