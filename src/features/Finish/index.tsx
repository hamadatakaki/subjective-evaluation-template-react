import type React from 'react'
import type { FinishState } from '../../hooks'
import { useApi } from '../../utils/api'
import ErrorPage from '../Error'
import { useProlificId } from '../../hooks/pid'
import Completion from './Completion'

type ApiResponse = {
  completionCode: string
}
type ApiError = {
  reason: 'invalid-finish'
}

type FinishProps = Omit<FinishState, 'step'>

const FinishPage: React.FC<FinishProps> = ({
  sequence,
  evaluations,
}) => {
  const { pid } = useProlificId()

  const { error } = useApi<ApiResponse, ApiError>({
    url: 'finish.php',
    body: {
      pid,
      sequence,
      evaluations,
    },
  })

  if (error != null) {
    return <ErrorPage reason="invalid-finish" />
  }

  return (
    <div className="stack">
      <h2>End Page</h2>
      <p>
        Thank you for your participation. The experiment is now
        complete.
      </p>
      <p>Please enter the completion code on Prolific.</p>
      <Completion />
    </div>
  )
}

export default FinishPage
