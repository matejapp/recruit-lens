import { useNavigate } from 'react-router-dom'

const PAPER_URL = 'https://casopisrevizor.rs/index.php/revizor/article/view/246'
const DOI_URL   = 'https://doi.org/10.46793/Rev25112.091P'

const AUTHORS = [
  { name: 'Mateja Pavlović',  initials: 'MP' },
  { name: 'Luka Glišović',   initials: 'LG' },
  { name: 'Vuk Mirčetić',    initials: 'VM' },
]

const KEYWORDS = [
  'Algorithmic Bias',
  'Resume Screening',
  'Recruitment',
  'Selection',
  'Data-Driven Decision Making',
  'Job Application',
]

const BIAS_SIGNALS = [
  {
    type:    'Graduation Year',
    proxies: 'Age',
    sev:     'medium',
    cite:    'Köchling & Wehner (2020)',
  },
  {
    type:    'Foreign Name',
    proxies: 'Ethnicity / National Origin',
    sev:     'high',
    cite:    'Mehrabi et al. (2021)',
  },
  {
    type:    'Home Address',
    proxies: 'Socioeconomic Status',
    sev:     'low',
    cite:    'Raghavan et al. (2020)',
  },
  {
    type:    'Employment Gap',
    proxies: 'Disability or Caregiving',
    sev:     'medium',
    cite:    'Glazko et al. (2024)',
  },
  {
    type:    'Disability Language',
    proxies: 'Disability Status',
    sev:     'high',
    cite:    'Glazko et al. (2024)',
  },
  {
    type:    'Photo Reference',
    proxies: 'Gender, Ethnicity or Age',
    sev:     'high',
    cite:    'Bogen & Rieke (2018)',
  },
  {
    type:    'University Prestige',
    proxies: 'Socioeconomic Class',
    sev:     'low',
    cite:    'Raghavan et al. (2020)',
  },
  {
    type:    'Gendered Language',
    proxies: 'Gender',
    sev:     'medium',
    cite:    'Köchling & Wehner (2020)',
  },
]

function CopyButton({ text }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return (
    <button className="copy-btn" onClick={handleCopy} aria-label="Copy citation">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copy
    </button>
  )
}

const APA_CITATION =
  'Pavlović, M., Glišović, L., & Mirčetić, V. (2026). Uticaj veštačke inteligencije na savremene prakse regrutacije i selekcije. REVIZOR, 28(4). https://doi.org/10.46793/Rev25112.091P'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <main className="app-main about-page">
      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-journal-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          REVIZOR Journal · Vol. 28, No. 4 (112) · 2026
        </div>
        <h1 className="about-title">
          The Research Behind<br />
          <span>RecruitLens</span>
        </h1>
        <p className="about-subtitle">
          This tool is the practical implementation of a peer-reviewed study on
          algorithmic bias in AI-driven recruitment systems.
        </p>
      </section>

      {/* ── Paper card ── */}
      <section className="about-paper-card">
        <div className="paper-titles">
          <h2 className="paper-title-en">
            The Impact of Artificial Intelligence on Contemporary
            Recruitment and Selection Practices
          </h2>
          <p className="paper-title-sr">
            Uticaj veštačke inteligencije na savremene prakse regrutacije i selekcije
          </p>
        </div>

        <div className="paper-meta-grid">
          <div className="paper-meta-item">
            <span className="paper-meta-label">Journal</span>
            <span className="paper-meta-value">REVIZOR</span>
          </div>
          <div className="paper-meta-item">
            <span className="paper-meta-label">Volume / Issue</span>
            <span className="paper-meta-value">Vol. 28, No. 4 (112)</span>
          </div>
          <div className="paper-meta-item">
            <span className="paper-meta-label">Published</span>
            <span className="paper-meta-value">January 23, 2026</span>
          </div>
          <div className="paper-meta-item">
            <span className="paper-meta-label">ISSN (Print)</span>
            <span className="paper-meta-value paper-meta-mono">1450-7005</span>
          </div>
          <div className="paper-meta-item">
            <span className="paper-meta-label">ISSN (Online)</span>
            <span className="paper-meta-value paper-meta-mono">2620-1461</span>
          </div>
          <div className="paper-meta-item">
            <span className="paper-meta-label">DOI</span>
            <a
              href={DOI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="paper-meta-value paper-meta-mono paper-doi-link"
            >
              10.46793/Rev25112.091P ↗
            </a>
          </div>
        </div>

        <div className="paper-keywords">
          {KEYWORDS.map((kw) => (
            <span key={kw} className="tag">{kw}</span>
          ))}
        </div>
      </section>

      {/* ── Research context ── */}
      <section className="about-section">
        <h3 className="about-section-title">What the Research Found</h3>
        <div className="about-findings-grid">
          <div className="finding-card">
            <div className="finding-icon" aria-hidden="true">🔍</div>
            <h4>Black-Box Opacity</h4>
            <p>
              Modern ATS systems rank and filter candidates without disclosing
              their criteria. Candidates submit resumes blind — with no feedback
              on why they were filtered out.
            </p>
          </div>
          <div className="finding-card">
            <div className="finding-icon" aria-hidden="true">⚠️</div>
            <h4>Proxy Discrimination</h4>
            <p>
              Neutral resume elements — names, addresses, graduation years —
              act as statistical proxies for protected characteristics, allowing
              automated systems to discriminate without explicit intent.
            </p>
          </div>
          <div className="finding-card">
            <div className="finding-icon" aria-hidden="true">📚</div>
            <h4>Historical Bias Perpetuation</h4>
            <p>
              AI systems trained on historical hiring data learn and amplify
              past discrimination patterns, systematically disadvantaging
              groups that were previously underrepresented.
            </p>
          </div>
          <div className="finding-card">
            <div className="finding-icon" aria-hidden="true">⚖️</div>
            <h4>Regulatory Gap</h4>
            <p>
              Existing anti-discrimination law was written for human
              decision-makers. Algorithmic systems exploit definitional gaps,
              making enforcement difficult without new regulatory frameworks.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8 bias signals ── */}
      <section className="about-section">
        <h3 className="about-section-title">
          8 Proxy Bias Signals Documented in the Research
        </h3>
        <p className="about-section-sub">
          These are the specific patterns RecruitLens detects — each grounded
          in peer-reviewed algorithmic bias literature cited in the paper.
        </p>
        <div className="bias-signal-grid">
          {BIAS_SIGNALS.map((s) => (
            <div key={s.type} className={`bias-signal-card bias-signal-card--${s.sev}`}>
              <div className="bias-signal-top">
                <span className={`sev-badge ${s.sev}`}>{s.sev}</span>
              </div>
              <h4 className="bias-signal-type">{s.type}</h4>
              <p className="bias-signal-proxies">
                <span className="proxies-label">Proxies for</span> {s.proxies}
              </p>
              <p className="bias-signal-cite">{s.cite}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Authors ── */}
      <section className="about-section">
        <h3 className="about-section-title">Authors</h3>
        <p className="about-section-sub">
          Faculty of Applied Management, Economics and Finance ·
          University Business Academy in Novi Sad · Belgrade, Serbia
        </p>
        <div className="authors-grid">
          {AUTHORS.map((a) => (
            <div key={a.name} className="author-card">
              <div className="author-avatar" aria-hidden="true">{a.initials}</div>
              <span className="author-name">{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Citation ── */}
      <section className="about-section">
        <h3 className="about-section-title">Cite This Work</h3>
        <div className="cite-block">
          <div className="cite-label">APA 7</div>
          <p className="cite-text">{APA_CITATION}</p>
          <CopyButton text={APA_CITATION} />
        </div>
      </section>

      {/* ── CTAs ── */}
      <div className="about-cta-row">
        <a
          href={PAPER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary about-cta-btn"
          style={{ display: 'inline-flex', maxWidth: 220, textDecoration: 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Read Full Paper
        </a>
        <button
          className="btn-ghost about-cta-btn"
          onClick={() => navigate('/')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Try the Tool
        </button>
      </div>
    </main>
  )
}
