import React, { Component } from 'react'
import { LogContent } from '../controls/judgelog'

class JudgeLog extends Component<Prop> {
  private lastUpdated = new Date(0)
  private timer: ReturnType<typeof setInterval> | null = null

  constructor (props: Prop) {
    super(props)
  }
}
interface Prop {
  name: string
  updateResults: (content: LogContent) => void
  verdict: string
}
