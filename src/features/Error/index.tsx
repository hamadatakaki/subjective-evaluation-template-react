import type React from 'react'
import type { ErrorState } from '../../hooks'
import Completion from '../Finish/Completion'

type ErrorProps = Pick<ErrorState, 'reason'>

const ErrorPage: React.FC<ErrorProps> = ({ reason }) => {
  if (reason === 'invalid-prolific-id') {
    return (
      <div>
        Your Prolific ID is invalid. Please restart the test
        from the Prolific page.
      </div>
    )
  }

  if (reason === 'already-finished') {
    return (
      <div>
        <p>
          You have already completed this test. Thank you for
          your participation.
        </p>
        <Completion />
      </div>
    )
  }

  if (reason === 'participant-limit-exceeded') {
    return (
      <div>
        We were unable to register your participation. Please
        try again later.
      </div>
    )
  }

  if (reason === 'invalid-finish') {
    return (
      <div>
        The study did not finish properly. Please try again
        later.
      </div>
    )
  }

  return (
    <div>
      An unexpected error occurred. Please try again later.
    </div>
  )
}

export default ErrorPage
