import { useState, useRef, useCallback } from 'react'
import { validateFile, JD_MAX, JD_MIN } from '../lib/validation'

const ALLOWED_TYPES = '.pdf,.docx'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default function UploadForm({ onAnalyze, externalError }) {
  const [file, setFile]         = useState(null)
  const [jd, setJd]             = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fieldError, setFieldError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fileInputRef = useRef(null)

  // Merge field error with external (server) error
  const visibleError = fieldError || externalError

  const handleFile = useCallback((selected) => {
    setFieldError(null)
    const check = validateFile(selected)
    if (!check.valid) {
      setFieldError({ field: 'file', message: check.error })
      return
    }
    setFile(selected)
  }, [])

  // ── Drag & Drop ──────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  // ── File input change ─────────────────────────
  const onInputChange = (e) => {
    const selected = e.target.files[0]
    if (selected) handleFile(selected)
    e.target.value = '' // allow re-selecting same file
  }

  // ── Submit ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError(null)

    if (!file) {
      setFieldError({ field: 'file', message: 'Please upload your resume.' })
      return
    }

    const trimmedJd = jd.trim()
    if (trimmedJd.length < JD_MIN) {
      setFieldError({
        field: 'jd',
        message: `Paste the full job description (min ${JD_MIN} characters, got ${trimmedJd.length}).`,
      })
      return
    }
    if (trimmedJd.length > JD_MAX) {
      setFieldError({ field: 'jd', message: `Job description exceeds ${JD_MAX.toLocaleString()} character limit.` })
      return
    }

    setSubmitting(true)
    await onAnalyze(file, trimmedJd)
    setSubmitting(false)
  }

  const jdLen   = jd.length
  const jdWarn  = jdLen > JD_MAX * 0.9
  const jdOver  = jdLen > JD_MAX
  const canSubmit = !!file && jdLen >= JD_MIN && !jdOver && !submitting

  return (
    <div className="upload-wrap">
      <div className="upload-hero">
        <h1>Know What the <span>Algorithm</span> Sees</h1>
        <p>
          ATS simulation + algorithmic bias detection, grounded in peer-reviewed
          research on automated recruitment discrimination.
        </p>
      </div>

      <form className="upload-card" onSubmit={handleSubmit} noValidate>
        {/* ── File Dropzone ── */}
        <div
          className={`dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Upload resume — click or drag and drop"
          onClick={() => !file && fileInputRef.current?.click()}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !file) fileInputRef.current?.click() }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES}
            style={{ display: 'none' }}
            onChange={onInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          {file ? (
            <div className="file-info">
              {/* Document icon */}
              <svg className="file-icon" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
              </svg>
              <div className="file-details">
                <div className="file-name" title={file.name}>{file.name}</div>
                <div className="file-size">{formatBytes(file.size)}</div>
              </div>
              <button
                type="button"
                className="file-remove"
                aria-label="Remove file"
                onClick={(e) => { e.stopPropagation(); setFile(null); setFieldError(null) }}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              {/* Upload icon */}
              <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="dropzone-label">Drop your resume here</span>
              <span className="dropzone-sub">PDF or DOCX · Max 5 MB</span>
            </>
          )}
        </div>

        {/* File error */}
        {visibleError?.field === 'file' && (
          <div className="field-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {visibleError.message}
          </div>
        )}

        {/* ── Job Description ── */}
        <div className="form-section">
          <label className="form-label" htmlFor="jd-input">
            Job Description
          </label>
          <div className="jd-wrap">
            <textarea
              id="jd-input"
              className="jd-textarea"
              placeholder="Paste the full job posting here…"
              value={jd}
              onChange={(e) => { setJd(e.target.value); setFieldError(null) }}
              maxLength={JD_MAX + 200}
              aria-describedby={visibleError?.field === 'jd' ? 'jd-error' : undefined}
            />
            <span
              className={`jd-counter${jdOver ? ' over' : jdWarn ? ' warn' : ''}`}
              aria-live="polite"
            >
              {jdLen.toLocaleString()} / {JD_MAX.toLocaleString()}
            </span>
          </div>
          {visibleError?.field === 'jd' && (
            <div className="field-error" id="jd-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {visibleError.message}
            </div>
          )}
        </div>

        {/* Server / submit error */}
        {visibleError?.field === 'submit' && (
          <div className="field-error" style={{ marginTop: 12 }} role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {visibleError.message}
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          className="btn-primary"
          disabled={!canSubmit}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Analyze Resume
            </>
          )}
        </button>

        <p className="privacy-note" aria-label="Privacy assurance">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Your resume is never stored or logged — processing is stateless.
        </p>
      </form>
    </div>
  )
}
