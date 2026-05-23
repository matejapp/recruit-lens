import { useState, useEffect } from 'react'

const STEPS = [
  'Parsing resume document',
  'Simulating ATS keyword matching',
  'Detecting bias signals',
  'Analysing keyword gaps',
  'Generating suggestions',
  'Finalising analysis',
]

export default function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <h2 className="loading-title">Analysing Resume</h2>

      {/* Fake document + scan beam */}
      <div className="scan-card" aria-hidden="true">
        <div className="scan-highlight" />
        <div className="scan-lines-bg">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="scan-line-fake" />
          ))}
        </div>
        <div className="scan-beam" />
      </div>

      <div className="loading-status">
        <p className="loading-status-text" key={step}>
          {STEPS[step]}
          <span className="loading-dots" aria-hidden="true">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </span>
        </p>
        <p className="loading-hint">This takes 3–8 seconds</p>
      </div>
    </div>
  )
}
