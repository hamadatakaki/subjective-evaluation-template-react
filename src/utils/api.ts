import { useEffect, useMemo, useState } from 'react'

const API_URL_BASE: string =
  import.meta.env.VITE_API_URL_BASE ?? '.'

type ApiRequest = {
  url: string
  body?: Record<string, unknown>
  skip?: boolean
}

type ApiResponse<T, E> = {
  data?: T
  error?: E
  loaded: boolean
}

export function useApi<T, E = string>({
  url: _url,
  body = {},
  skip = false,
}: ApiRequest): ApiResponse<T, E> {
  const [state, setState] = useState<ApiResponse<T, E>>({
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
      .then(async (res) => {
        if (res.ok) {
          return (await res.json()) as T
        }
        // error
        const data = (await res.json()) as E
        throw {
          name: 'http-response-error',
          ...data,
        }
      })
      .then((data) => {
        setState({ data, loaded: true })
      })
      .catch((err) => {
        if (err === 'cleanup') {
          return
        }
        setState({ error: err, loaded: true })
      })

    return () => controller.abort('cleanup')
  }, [url, skip, bodyString])

  useEffect(() => {
    if (state.error != null) {
      console.error(state.error)
    }
  }, [state.error])

  return state
}
