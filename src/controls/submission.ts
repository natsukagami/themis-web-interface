import { LogContent } from './judgelog'

// The following tables list supported languages and their respective conversion
// between name and extension name.
export type Ext = 'cpp' | 'pas' | 'py' | 'java'
export type Lang = 'C++' | 'Pascal' | 'Python' | 'Java'
export type SaveStatus = 'saved' | 'submitting' | 'submitted'

export const extTable: { [key in Lang]: Ext } = {
  'C++': 'cpp',
  Pascal: 'pas',
  Python: 'py',
  Java: 'java'
}
export const langTable: { [key in Ext]: Lang } = {
  cpp: 'C++',
  pas: 'Pascal',
  py: 'Python',
  java: 'Java'
}

export interface ISubmissionName {
  filename: string
  lang: Lang
}

/**
 * ISubmission allows data-only structures of Submission.
 */
export interface ISubmission extends ISubmissionName {
  content: string
  saveStatus: SaveStatus
  result?: LogContent
}

export function filenameOf (s: ISubmissionName): string {
  return s.filename + '.' + extTable[s.lang]
}

/**
 * Submission is an unified struct shared by both the server and client that
 * represents a submission.
 */
export default class Submission implements ISubmission {
  // The global submission counter
  static id: number = 0

  public id: number
  public filename: string
  public lang: Lang
  public content: string
  public saveStatus: SaveStatus
  public result?: LogContent

  constructor ({
    filename,
    lang,
    content = '',
    saveStatus = 'saved',
    result
  }: {
    filename: string;
    lang: Lang;
    content?: string;
    saveStatus?: SaveStatus;
    result?: LogContent;
  }) {
    this.id = ++Submission.id
    this.filename = filename
    this.lang = lang
    this.content = content
    this.saveStatus = saveStatus
    this.result = result
  }

  /**
   * Returns the filename.
   */
  get name (): string {
    return filenameOf(this)
  }

  /**
   * Returns an object that contains the submission's information.
   * Can be useful for JSON serialization and sending.
   */
  toSend () {
    return {
      filename: this.filename,
      lang: this.lang,
      content: this.content
    }
  }
}
