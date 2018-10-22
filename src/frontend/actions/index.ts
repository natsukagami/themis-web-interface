import { ActionType } from 'typesafe-actions'
import * as submissions from './submissions'
import * as submission from './submission'
import * as log from './log'
import * as files from './files'
import * as addForms from './add-forms'
import * as queue from './queue'
import * as contestClock from './contest-clock'

export type SubmissionsAction = ActionType<typeof submissions>
export type SubmissionAction = ActionType<typeof submission>
export type LogAction = ActionType<typeof log>
export type FilesAction = ActionType<typeof files>
export type AddFormsAction = ActionType<typeof addForms>
export type QueueAction = ActionType<typeof queue>
export type ContestClockAction = ActionType<typeof contestClock>

type RootAction =
  | SubmissionsAction
  | SubmissionAction
  | LogAction
  | FilesAction
  | AddFormsAction
  | QueueAction
  | ContestClockAction
export default RootAction
