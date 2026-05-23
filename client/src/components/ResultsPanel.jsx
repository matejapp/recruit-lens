import { useState, useEffect, useRef } from 'react'

// ─── Score ring with animated fill ───────────────────────────────────────────
const RADIUS = 72
const STROKE = 9
const CIRC   = 2 * Math.PI * RADIUS

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (target == null) return
    let start = null

    const tick = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return count
}

function ScoreRing({ score }) {
  const [offset, setOffset] = useState(CIRC)
  const displayed = useCountUp(score)

  useEffect(() => {
    const id = setTimeout(() => setOffset(CIRC - (score / 100) * CIRC), 120)
    return () => clearTimeout(id)
  }, [score])

  const color = score >= 70 ? 'var(--pass)' : score >= 50 ? 'var(--sev-med)' : 'var(--sev-high)'

  return (
    <div className="score-ring-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r={RADIUS} className="ring-track"
          strokeWidth={STROKE} />
        <circle
          cx="80" cy="80" r={RADIUS}
          className="ring-fill"
          strokeWidth={STROKE}
          style={{
            strokeDasharray:  CIRC,
            strokeDashoffset: offset,
            stroke:  color,
            filter:  `drop-shadow(0 0 10px ${color})`,
            transformOrigin: '80px 80px',
          }}
        />
      </svg>
      <div className="score-label">
        <span className="score-number">{displayed}</span>
        <span className="score-unit">/100</span>
      </div>
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
function tabList(result) {
  return [
    { id: 'overview',    label: 'ATS Overview' },
    { id: 'bias',        label: 'Bias Signals', count: result.bias_signals?.length ?? 0 },
    { id: 'gaps',        label: 'Keyword Gaps' },
    { id: 'suggestions', label: 'Suggestions',  count: result.suggestions?.length ?? 0 },
  ]
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ result }) {
  const { ats_score, ats_simulation, extracted_entities } = result
  const passed = ats_simulation?.likely_passed

  return (
    <div className="tab-pane">
      <div className="overview-grid">
        {/* Score panel */}
        <div className="score-panel">
          <ScoreRing score={ats_score} />
          <div className={`pass-badge ${passed ? 'pass' : 'fail'}`}>
            {passed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6"  y1="6" x2="18" y2="18" />
              </svg>
            )}
            {passed ? 'Likely Pass' : 'Likely Fail'}
          </div>
        </div>

        {/* Details */}
        <div className="overview-detail">
          {/* ATS reasoning */}
          <div className="detail-card">
            <p className="detail-card-label">ATS Reasoning</p>
            <p className="reasoning-text">{ats_simulation?.reasoning}</p>
          </div>

          {/* Skills */}
          {extracted_entities?.skills?.length > 0 && (
            <div className="detail-card">
              <p className="detail-card-label">Detected Skills</p>
              <div className="tag-cloud">
                {extracted_entities.skills.map((s, i) => (
                  <span key={i} className="tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {extracted_entities?.education?.length > 0 && (
            <div className="detail-card">
              <p className="detail-card-label">Education</p>
              {extracted_entities.education.map((e, i) => (
                <div key={i} className="edu-item">
                  <span className="edu-degree">{e.degree}</span>
                  <span className="edu-meta">{e.institution}{e.year ? ` · ${e.year}` : ''}</span>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {extracted_entities?.experience?.length > 0 && (
            <div className="detail-card">
              <p className="detail-card-label">Experience</p>
              {extracted_entities.experience.map((e, i) => (
                <div key={i} className="exp-item">
                  <span className="exp-title">{e.title}</span>
                  <span className="exp-meta">{e.company}{e.duration ? ` · ${e.duration}` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Bias signals tab ─────────────────────────────────────────────────────────
function BiasTab({ signals }) {
  if (!signals || signals.length === 0) {
    return (
      <div className="tab-pane">
        <div className="bias-empty">
          <svg className="bias-empty-icon" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <h3>No Bias Signals Detected</h3>
          <p>Your resume does not contain the 8 known proxy discrimination patterns. Keep it up.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-pane">
      <div className="bias-list">
        {signals.map((sig, i) => (
          <article key={i} className="bias-card">
            <div className={`bias-bar ${sig.severity}`} aria-label={`${sig.severity} severity`} />
            <div className="bias-content">
              <div className="bias-top">
                <span className="bias-type">{sig.type.replace(/_/g, ' ')}</span>
                <span className={`sev-badge ${sig.severity}`}>{sig.severity}</span>
              </div>
              {sig.excerpt && (
                <blockquote className="bias-excerpt">"{sig.excerpt}"</blockquote>
              )}
              <p className="bias-explanation">{sig.explanation}</p>
              <p className="bias-citation">{sig.research_basis}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// ─── Keyword gaps tab ─────────────────────────────────────────────────────────
function GapsTab({ gaps }) {
  const columns = [
    { key: 'hard_skills',   label: 'Hard Skills',   icon: '⚙' },
    { key: 'soft_skills',   label: 'Soft Skills',   icon: '💬' },
    { key: 'certifications', label: 'Certifications', icon: '🏅' },
  ]

  return (
    <div className="tab-pane">
      <div className="gaps-grid">
        {columns.map(({ key, label, icon }) => {
          const items = gaps?.[key] ?? []
          return (
            <div key={key} className="gaps-col">
              <p className="gaps-col-title">
                <span aria-hidden="true">{icon}</span>
                {label}
              </p>
              {items.length === 0 ? (
                <p className="gaps-empty">No gaps found</p>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="gap-tag">
                    <svg className="gap-plus" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5"  y1="12" x2="19" y2="12" />
                    </svg>
                    {item}
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Suggestions tab ─────────────────────────────────────────────────────────
function SuggestionsTab({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="tab-pane">
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>No suggestions generated.</p>
      </div>
    )
  }

  return (
    <div className="tab-pane">
      <div className="suggestions-list">
        {suggestions.map((s, i) => (
          <div key={i} className="suggestion-card">
            <div className="suggestion-num">{i + 1}</div>
            <p className="suggestion-text">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ResultsPanel ────────────────────────────────────────────────────────
export default function ResultsPanel({ result, onReset }) {
  const [activeTab, setActiveTab] = useState('overview')
  const tabs = tabList(result)

  return (
    <div className="results-wrap">
      <div className="results-header">
        <h2>Analysis <span>Complete</span></h2>
        <button className="btn-reset" onClick={onReset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-5" />
          </svg>
          Analyze Another
        </button>
      </div>

      {/* Tab navigation */}
      <nav className="tabs" aria-label="Analysis sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            role="tab"
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="tab-badge" aria-label={`${tab.count} items`}>{tab.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab panels */}
      <div role="tabpanel" id={`panel-${activeTab}`}>
        {activeTab === 'overview'    && <OverviewTab    result={result} />}
        {activeTab === 'bias'        && <BiasTab        signals={result.bias_signals} />}
        {activeTab === 'gaps'        && <GapsTab        gaps={result.keyword_gaps} />}
        {activeTab === 'suggestions' && <SuggestionsTab suggestions={result.suggestions} />}
      </div>

      {/* Disclaimer — always visible */}
      <footer className="disclaimer" aria-label="Disclaimer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8"  x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {result.disclaimer}
      </footer>
    </div>
  )
}
