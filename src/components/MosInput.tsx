import type React from 'react'
import {
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react'

type MosInputProps = {
  minValue?: number
  maxValue?: number
  value: number | undefined
  setValue: Dispatch<SetStateAction<number | undefined>>
  toLabel: (value: number) => string
}

const MosInput: React.FC<MosInputProps> = ({
  minValue = 1,
  maxValue = 5,
  value,
  setValue,
  toLabel,
}) => {
  const options = useMemo(
    () =>
      Array.from(
        { length: maxValue - minValue + 1 },
        (_, i) => maxValue - i
      ),
    [maxValue, minValue]
  )

  return (
    <div
      role="radiogroup"
      aria-label="MOS rating"
      className="stack"
    >
      {options.map((option) => (
        <label key={option} style={{ textAlign: 'left' }}>
          <input
            type="radio"
            name="mos"
            value={option}
            checked={value === option}
            onChange={() => setValue(option)}
          />
          <b>{option}:</b> {toLabel(option)}
        </label>
      ))}
    </div>
  )
}
export default MosInput
