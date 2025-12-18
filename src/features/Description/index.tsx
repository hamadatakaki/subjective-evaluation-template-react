import type React from 'react'
import AudioPlayer from '../../components/Audio'
import { useState } from 'react'
import { toNaturalnessMosLabel } from '../../utils/mos'

type DescriptionProps = {
  onStart: () => void
}

const DescriptionPage: React.FC<DescriptionProps> = ({
  onStart,
}) => {
  const [isDisabled, setIsDisabled] = useState(true)

  const onEnded = () => {
    setIsDisabled(false)
  }

  const options = [5, 4, 3, 2, 1]

  return (
    <div>
      <div className="stack">
        <h2>Description</h2>
        <p>
          In this experiment, you will listen to audio samples
          and evaluate their <b>naturalness</b>.
        </p>
        <p>
          Here, <i>naturalness</i> refers to how naturally the
          speech sounds as human speech. Please focus on aspects
          such as unnatural pronunciation, unnatural prosody or
          intonation, and any synthetic artifacts. The content
          or meaning of the speech is not part of the
          evaluation.
        </p>
        <p>
          In each trial, an audio sample will be played. Please
          listen carefully until the end. After listening, rate
          the naturalness of the speech using the following{' '}
          <b>5-point scale (MOS: Mean Opinion Score)</b>
        </p>
        <ul>
          {options.map((option) => (
            <li key={option}>
              <b>{option}：</b> {toNaturalnessMosLabel(option)}
            </li>
          ))}
        </ul>
        <p>
          Please base your ratings on your own subjective
          judgment. There are no right or wrong answers.
        </p>
      </div>

      <hr />

      <div className="stack">
        <h2>Example</h2>
        <p>Below is an example audio sample.</p>
        <p>
          Please make sure that you can hear the audio properly
          in your current environment.
        </p>
        <AudioPlayer audioPath="./demo.wav" onEnded={onEnded} />
      </div>

      <hr />

      <div>
        <p>
          When you are ready, please click the <b>Start</b>{' '}
          button to begin.
        </p>
        <button onClick={onStart} disabled={isDisabled}>
          Start
        </button>
      </div>
    </div>
  )
}

export default DescriptionPage
