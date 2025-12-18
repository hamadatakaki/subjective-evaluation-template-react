import { useCallback, useState, type Dispatch } from 'react'

export type EntryState = {
  step: 'entry'
}

export type DescriptionState = {
  step: 'description'
  sequence: string
  sequenceSize: number
}

export type TestState = {
  step: 'test'
  sequence: string
  sequenceSize: number
  order: number
  evaluations: Array<number>
}

export type FinishState = {
  step: 'finish'
  sequence: string
  evaluations: Array<number>
}

export type ErrorReason =
  | 'invalid-prolific-id'
  | 'participant-limit-exceeded'
  | 'already-finished'
  | 'invalid-finish'
  | 'bad-request'

export type ErrorState = {
  step: 'error'
  reason: ErrorReason
}

export type PageState =
  | EntryState
  | DescriptionState
  | TestState
  | FinishState
  | ErrorState

export const usePageState = () => {
  const [state, setState] = useState<PageState>({
    step: 'entry',
  })

  const onEntry: Dispatch<Omit<DescriptionState, 'step'>> =
    useCallback((value) => {
      setState({
        step: 'description',
        ...value,
      })
    }, [])

  const onStart = useCallback(() => {
    setState((prev) => {
      if (prev.step === 'description') {
        return {
          ...prev,
          step: 'test',
          order: 0,
          evaluations: [],
        }
      }

      return prev
    })
  }, [])

  const onNext: Dispatch<number> = useCallback((value) => {
    setState((prev) => {
      if (prev.step !== 'test') {
        return prev
      }

      const nextOrder = prev.order + 1
      const nextEvaluations = [...prev.evaluations, value]

      if (nextOrder >= prev.sequenceSize) {
        return {
          step: 'finish',
          evaluations: nextEvaluations,
          sequence: prev.sequence,
        }
      }

      return {
        ...prev,
        step: 'test',
        order: nextOrder,
        evaluations: nextEvaluations,
      }
    })
  }, [])

  const onError: Dispatch<ErrorReason> = useCallback(
    (reason) => {
      setState({
        step: 'error',
        reason,
      })
    },
    []
  )

  return {
    state,
    onEntry,
    onStart,
    onNext,
    onError,
  }
}
