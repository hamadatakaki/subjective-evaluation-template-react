import { useEffect } from 'react'
import './style/App.css'
import { useApi } from './utils/api'

function App() {
  const { data, loaded, error } = useApi({
    url: 'api.php',
    body: {
      hoge: 'from App.tsx',
      fuga: 42,
    },
  })
  if (error) {
    console.log('[debug] error:', error)
  }

  useEffect(() => {
    console.log('[debug] data:', data)
  }, [data])

  useEffect(() => {
    console.log('[debug] loaded:', loaded)
  }, [loaded])

  return (
    <>
      <h1>評価実験</h1>
      <div>{loaded ? 'loaded' : 'loading'}</div>
    </>
  )
}

export default App
