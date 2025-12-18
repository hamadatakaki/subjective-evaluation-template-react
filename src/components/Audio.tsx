import type React from 'react'
import { useEffect, useRef, useState } from 'react'

type AudioProps = {
  audioPath: string
  onEnded: () => void
}

const AudioPlayer: React.FC<AudioProps> = ({
  audioPath,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const onPlay = () => {
    if (audioRef.current != null) {
      audioRef.current.play()
    }
  }

  const onPause = () => {
    if (audioRef.current != null) {
      audioRef.current.pause()
    }
  }

  const onReset = () => {
    if (audioRef.current != null) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime)
    }

    const onLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener(
        'loadedmetadata',
        onLoadedMetadata
      )
    }
  }, [])

  return (
    <div className="stack">
      <p>
        {current.toFixed(1)} / {duration.toFixed(1)} [s]
      </p>
      <div className="hstack">
        <button onClick={onPlay}>▶ Play</button>
        <button onClick={onPause}>⏸ Pause</button>
        <button onClick={onReset}>⏮ Reset</button>
        <audio ref={audioRef} onEnded={onEnded}>
          <source src={audioPath} type="audio/wav" />
        </audio>
      </div>
    </div>
  )
}

export default AudioPlayer
