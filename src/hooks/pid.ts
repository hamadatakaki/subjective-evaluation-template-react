import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const PROLIFIC_ID_KEY = 'PROLIFIC_PID'

export const useProlificId = () => {
  const [searchParams] = useSearchParams()
  const pid = useMemo(
    () => searchParams.get(PROLIFIC_ID_KEY) ?? '',
    [searchParams]
  )

  return { pid }
}
