import { useEffect, useMemo, useState } from 'react'

const API_URL_BASE: string =
  import.meta.env.VITE_API_URL_BASE ?? '.'

type ApiRequest = {
  url: string
  body: Record<string, unknown>
  skip?: boolean
}

type ApiResponse<T> = {
  data?: T
  error?: string
  loaded: boolean
}

export function useApi<T>({
  url: _url,
  body,
  skip = false,
}: ApiRequest): ApiResponse<T> {
  const [state, setState] = useState<ApiResponse<T>>({
    data: undefined,
    loaded: false,
    error: undefined,
  })

  const url = useMemo(() => `${API_URL_BASE}/${_url}`, [_url])
  const bodyString = useMemo(() => JSON.stringify(body), [body])

  useEffect(() => {
    if (skip) {
      return
    }

    const controller = new AbortController()

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.json() as Promise<T>
      })
      .then((data) => {
        setState({ data, loaded: true })
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return
        }
        setState({ error: err.message, loaded: true })
      })

    return () => controller.abort('cleanup')
  }, [url, skip, bodyString])

  return state
}
