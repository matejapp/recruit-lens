import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import UploadForm from './components/UploadForm'
import LoadingState from './components/LoadingState'
import ResultsPanel from './components/ResultsPanel'
import AboutPage from './components/AboutPage'
import ErrorBoundary from './components/ErrorBoundary'
import { analyzeResume } from './lib/api'
import { validateFile, validateFileMagicBytes, validateJobDescription } from './lib/validation'

function ToolPage({ onAnalyze, error, view, result, onReset }) {
  return (
    <main className="app-main">
      {view === 'upload' && (
        <UploadForm onAnalyze={onAnalyze} externalError={error} />
      )}
      {view === 'loading' && <LoadingState />}
      {view === 'results' && result && (
        <ResultsPanel result={result} onReset={onReset} />
      )}
    </main>
  )
}

export default function App() {
  const [view, setView]     = useState('upload')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState(null)

  const handleAnalyze = useCallback(async (file, jobDescription) => {
    setError(null)

    const fileCheck = validateFile(file)
    if (!fileCheck.valid) { setError({ field: 'file', message: fileCheck.error }); return }

    const magicCheck = await validateFileMagicBytes(file)
    if (!magicCheck.valid) { setError({ field: 'file', message: magicCheck.error }); return }

    const jdCheck = validateJobDescription(jobDescription)
    if (!jdCheck.valid) { setError({ field: 'jd', message: jdCheck.error }); return }

    setView('loading')

    try {
      const data = await analyzeResume(file, jobDescription)
      setResult(data)
      setView('results')
    } catch (err) {
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
        <Routes>
          <Route
            path="/"
            element={
              <ToolPage
                onAnalyze={handleAnalyze}
                error={error}
                view={view}
                result={result}
                onReset={handleReset}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}
