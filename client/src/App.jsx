import { useState, useCallback } from 'react'
import Header from './components/Header'
import UploadForm from './components/UploadForm'
import LoadingState from './components/LoadingState'
import ResultsPanel from './components/ResultsPanel'
import ErrorBoundary from './components/ErrorBoundary'
import { analyzeResume } from './lib/api'
import { validateFile, validateFileMagicBytes, validateJobDescription } from './lib/validation'

export default function App() {
  const [view, setView]     = useState('upload') // 'upload' | 'loading' | 'results'
  const [result, setResult] = useState(null)
  const [error, setError]   = useState(null)

  const handleAnalyze = useCallback(async (file, jobDescription) => {
    setError(null)

    // Pass 1: extension + size (synchronous)
    const fileCheck = validateFile(file)
    if (!fileCheck.valid) {
      setError({ field: 'file', message: fileCheck.error })
      return
    }

    // Pass 2: magic-byte verification (async, reads first 8 bytes only)
    const magicCheck = await validateFileMagicBytes(file)
    if (!magicCheck.valid) {
      setError({ field: 'file', message: magicCheck.error })
      return
    }

    // Pass 3: job description length
    const jdCheck = validateJobDescription(jobDescription)
    if (!jdCheck.valid) {
      setError({ field: 'jd', message: jdCheck.error })
      return
    }

    setView('loading')

    try {
      const data = await analyzeResume(file, jobDescription)
      setResult(data)
      setView('results')
    } catch (err) {
      // err is already a normalised { code, message } object from the axios interceptor
      setError({ field: 'submit', message: err.message ?? 'Analysis failed. Please try again.' })
      setView('upload')
    }
  }, [])

  const handleReset = useCallback(() => {
    setView('upload')
    setResult(null)
    setError(null)
  }, [])

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="bg-glow" aria-hidden="true" />
        <Header showBack={view === 'results'} onBack={handleReset} />
        <main className="app-main">
          {view === 'upload' && (
            <UploadForm onAnalyze={handleAnalyze} externalError={error} />
          )}
          {view === 'loading' && <LoadingState />}
          {view === 'results' && result && (
            <ResultsPanel result={result} onReset={handleReset} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}
