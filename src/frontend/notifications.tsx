import React, { Component } from 'react'
import Push from 'push.js'
import { Alert } from 'reactstrap'
import Noty from 'noty'

import 'push.js/bin/serviceWorker.min.js'

import 'noty/lib/noty.css'
import 'noty/lib/themes/mint.css'

/**
 * Create a notification
 */
export default async function notify (
  title: string,
  body: string,
  forceNoty: boolean = false
) {
  if (Push.Permission.has() && !forceNoty) {
    const res = await Push.create(title, { body })
    if (res !== null) return // If no notification is made, we jump to our second choice
  }
  new Noty({
    text: `<div><h3>${title}</h3></div><div>${body}</div>`,
    sounds: {
      sources: ['/public/notification.ogg'],
      conditions: ['docVisible', 'docHidden']
    }
  }).show()
}

/**
 * An alert that shows a prompt to ask for notification
 */
export class AskNotification extends Component<{}, { display: boolean }> {
  readonly state = {
    display: Push.Permission.get() === Push.Permission.DEFAULT
  }

  render () {
    return (
      <Alert isOpen={this.state.display} color='primary'>
        Please allow notifications for score announcements and submit reporters.
        <a
          href='#'
          className='float-right'
          onClick={() => {
            Push.Permission.request()
            this.setState({ display: false })
          }}
        >
          Allow or Deny
        </a>
      </Alert>
    )
  }
}
