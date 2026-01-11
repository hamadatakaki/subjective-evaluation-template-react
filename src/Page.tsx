import React, { useEffect } from 'react'

import { usePageState } from './hooks'
import EntryPage from './features/Entry'
import DescriptionPage from './features/Description'
import TestPage from './features/Test'
import ErrorPage from './features/Error'
import FinishPage from './features/Finish'

const IS_DEBUG: boolean =
  import.meta.env.VITE_IS_DEBUG === 'true'

const MainPage: React.FC = () => {
  const { state, onEntry, onNext, onStart, onError } =
    usePageState()

  useEffect(() => {
    if (IS_DEBUG) {
      console.log('[debug] state', { ...state })
    }
  }, [state])

  if (state.step === 'entry') {
    return <EntryPage onEntry={onEntry} onError={onError} />
  }

  if (state.step === 'description') {
    return <DescriptionPage onStart={onStart} />
  }

  if (state.step === 'test') {
    return (
      <TestPage key={state.order} {...state} onNext={onNext} />
    )
  }

  if (state.step === 'finish') {
    return <FinishPage {...state} />
  }

  return <ErrorPage reason={state.reason} />
}

export default MainPage
