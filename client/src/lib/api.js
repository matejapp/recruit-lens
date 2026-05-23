import axios from 'axios'

// In dev the Vite proxy rewrites /api → localhost:8000.
// In production VITE_API_URL is set in the Netlify dashboard.
const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 90_000,          // 90 s — Gemini can be slow after a cold start
  withCredentials: false,   // no cookies sent cross-origin
})

// Response interceptor — normalise every error into { code, message, status }
// so components never have to dig into axios internals.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const detail  = err.response.data?.detail
      const message = detail?.message ?? 'An unexpected error occurred.'
      const code    = detail?.code    ?? 'unknown_error'
      return Promise.reject({ code, message, status: err.response.status })
    }

    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return Promise.reject({
        code: 'timeout',
        message: 'The analysis is taking longer than expected. Please try again.',
        status: null,
      })
    }

    return Promise.reject({
      code: 'network_error',
      message: 'Could not reach the server. Check your connection and try again.',
      status: null,
    })
  }
)

/**
 * Submit a resume for analysis.
 * @param {File}   file
 * @param {string} jobDescription
 * @returns {Promise<AnalysisResponse>}
 */
export async function analyzeResume(file, jobDescription) {
  const form = new FormData()
  form.append('file', file)
  form.append('job_description', jobDescription.trim())

  const res = await client.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data
}

export async function checkHealth() {
  const res = await client.get('/health')
  return res.data
}
