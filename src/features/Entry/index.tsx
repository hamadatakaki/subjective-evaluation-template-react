import { type Dispatch } from 'react'
import { useApi } from '../../utils/api'
import type { DescriptionState, ErrorReason } from '../../hooks'
import { useProlificId } from '../../hooks/pid'

type ApiResponse = {
  sequence: string
  sequenceSize: number
}

type ApiError = {
  reason: ErrorReason
}

type EntryProps = {
  onEntry: Dispatch<Omit<DescriptionState, 'step'>>
  onError: Dispatch<ErrorReason>
}

const EntryPage: React.FC<EntryProps> = ({
  onEntry,
  onError,
}) => {
  const { pid } = useProlificId()

  const { data, loaded, error } = useApi<ApiResponse, ApiError>(
    {
      url: 'entry.php',
      body: {
        pid,
      },
    }
  )

  const onClick = () => {
    if (!loaded) {
      return
    }

    if (error != null) {
      const { reason } = error
      onError(reason)
      return
    }

    if (data != null) {
      onEntry(data)
      return
    }

    onError('bad-request')
  }

  return (
    // やること：英語にする
    <div>
      <div className="stack">
        <p>This experiment is a speech listening test.</p>
        <p>
          You will listen to audio samples and rate each one
          according to your own perception.
        </p>
        <p>
          Please assign a score to every sample based on your
          subjective judgment.
        </p>
        <p>
          Once you have evaluated all audio samples, a
          completion code for Prolific will be displayed.
        </p>
        <p>
          Please submit this code on Prolific to finalize your
          participation.
        </p>
        <p>
          <b>Note:</b>
        </p>
        <ul>
          <li>
            You can participate in this experiment only once.
            Please make sure to enter your responses carefully.
          </li>
          <li>
            We recommend completing the experiment in a quiet
            environment and using headphones or earphones if
            possible.
          </li>
          <li>
            Leaving the page during the experiment may prevent
            it from completing properly.
          </li>
          <li>
            Do not use the browser’s back button or the
            reload/refresh button at any time.
          </li>
        </ul>
        <p>
          When you are ready, please click the{' '}
          <b>Participate</b> button to begin.
        </p>
      </div>
      <hr />
      <button disabled={!loaded} onClick={onClick}>
        Participate
      </button>
    </div>
  )
}

export default EntryPage
