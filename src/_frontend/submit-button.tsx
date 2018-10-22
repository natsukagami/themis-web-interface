import React, { Component } from 'react'
import { Button } from 'reactstrap'
import { SaveStatus } from '../controls/submission'

interface Prop {
  saveStatus: SaveStatus
  onSubmit: () => Promise<void>
}

/**
 * The submit button. It is disabled when the code is already submitted.
 */
export default class SubmitButton extends Component<
  Prop,
  { disabled: boolean }
> {
  constructor (props: Prop) {
    super(props)
    this.state = { disabled: false }

    this.onClick = this.onClick.bind(this)
  }

  // update the state on load.
  componentDidMount () {
    this.setState({ disabled: this.props.saveStatus === 'submitted' })
  }

  // update the state on any change.
  componentWillReceiveProps (newProps: Prop) {
    this.setState({ disabled: newProps.saveStatus === 'submitted' })
  }

  onClick () {
    this.setState({ disabled: true }, async () => {
      await this.props.onSubmit()
      this.setState({ disabled: false })
    })
  }

  render () {
    return (
      <Button
        color='success'
        className='form-control'
        disabled={this.state.disabled}
        onClick={this.onClick}
      >
        Nộp bài
      </Button>
    )
  }
}
