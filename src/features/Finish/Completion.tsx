const PROLIFIC_COMPLETION_CODE: string =
  import.meta.env.VITE_PROLIFIC_COMPLETION_CODE ?? '.'

const Completion = () => {
  return (
    <p>
      <b>completion code:</b> {PROLIFIC_COMPLETION_CODE}
    </p>
  )
}

export default Completion
