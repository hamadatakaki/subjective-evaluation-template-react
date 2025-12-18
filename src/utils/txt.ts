import { useEffect, useRef, useState } from 'react'

type Response = {
  content?: string
  error?: string
  loaded: boolean
}

export function useTextFile(filename: string): Response {
  const [state, setState] = useState<Response>({
    content: undefined,
    loaded: false,
    error: undefined,
  })

  const requestId = useRef(0)

  useEffect(() => {
    const currentId = ++requestId.current
    const controller = new AbortController()

    fetch(`/${filename}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.text()
      })
      .then((content) => {
        if (requestId.current !== currentId) {
          return
        }
        setState({
          content,
          loaded: true,
          error: undefined,
        })
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return
        }
        if (requestId.current !== currentId) {
          return
        }
        setState({
          content: undefined,
          loaded: true,
          error: err.message,
        })
      })

    return () => {
      controller.abort()
    }
  }, [filename])

  return state
}
