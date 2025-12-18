import React, { useState, type Dispatch } from 'react'
import AudioPlayer from '../../components/Audio'
import MosInput from '../../components/MosInput'
import { type TestState } from '../../hooks'
import { toNaturalnessMosLabel } from '../../utils/mos'

type TestProps = Omit<TestState, 'step'> & {
  onNext: Dispatch<number>
}

const TestPage: React.FC<TestProps> = ({
  onNext,
  order,
  sequence,
}) => {
  // const promptPath = `./sequences/${sequence}/${order}/prompt.txt`
  // const { content } = useTextFile(promptPath)

  const audioPath = `./sequences/${sequence}/${order}/audio.wav`

  const [isDisabled, setIsDisabled] = useState(true)

  const onEnded = () => {
    setIsDisabled(false)
  }

  const [value, setValue] = useState<number>()

  return (
    <>
      <div className="stack">
        <h2>Audio sample</h2>
        <AudioPlayer audioPath={audioPath} onEnded={onEnded} />
      </div>
      <div>
        <h2>Evaluation</h2>
        <MosInput
          value={value}
          setValue={setValue}
          toLabel={toNaturalnessMosLabel}
        />
      </div>
      <hr />
      <button
        onClick={() => {
          if (value != null) {
            onNext(value)
          }
        }}
        disabled={isDisabled || value == null}
      >
        次へ
      </button>
    </>
  )
}

export default TestPage
