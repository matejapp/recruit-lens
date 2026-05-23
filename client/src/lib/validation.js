/**
 * Client-side security validation layer.
 *
 * Three lines of defence:
 *   1. Extension check  — fast, synchronous
 *   2. Magic-byte check — reads first 8 bytes to verify actual file format
 *   3. Input-length check — prevents prompt injection via oversized JDs
 */

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
const MIN_JD_CHARS   = 50
const MAX_JD_CHARS   = 10_000

// File format signatures (magic bytes)
const SIGNATURES = {
  pdf:  [0x25, 0x50, 0x44, 0x46],       // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04],       // PK\x03\x04  (ZIP/OOXML)
}

/** Pass 1 — extension + size (synchronous, instant feedback) */
export function validateFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }

  const name = (file.name || '').toLowerCase()
  const isPdf  = name.endsWith('.pdf')
  const isDocx = name.endsWith('.docx')

  if (!isPdf && !isDocx) {
    return { valid: false, error: 'Only PDF (.pdf) and Word (.docx) files are supported.' }
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' }
  }

  if (file.size > MAX_FILE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return { valid: false, error: `File is ${mb} MB — maximum is 5 MB. Try compressing your PDF.` }
  }

  return { valid: true, isPdf, isDocx }
}

/** Pass 2 — magic bytes (async, reads first 8 bytes only) */
export function validateFileMagicBytes(file) {
  return new Promise((resolve) => {
    const name = (file.name || '').toLowerCase()
    const expectedKey = name.endsWith('.pdf') ? 'pdf' : 'docx'
    const expected = SIGNATURES[expectedKey]

    const reader = new FileReader()

    reader.onload = (e) => {
      const bytes = new Uint8Array(e.target.result)
      const match = expected.every((byte, i) => bytes[i] === byte)

      if (!match) {
        resolve({
          valid: false,
          error: `File content does not match its extension (.${expectedKey}). Upload a genuine ${expectedKey.toUpperCase()} file.`,
        })
      } else {
        resolve({ valid: true })
      }
    }

    reader.onerror = () => resolve({ valid: false, error: 'Could not read the file.' })

    // Read only the first 8 bytes — never load the full file into memory here
    reader.readAsArrayBuffer(file.slice(0, 8))
  })
}

/** Pass 3 — job description length */
export function validateJobDescription(text) {
  const trimmed = (text || '').trim()

  if (trimmed.length < MIN_JD_CHARS) {
    return {
      valid: false,
      error: `Please paste the full job description (at least ${MIN_JD_CHARS} characters, got ${trimmed.length}).`,
    }
  }

  if (trimmed.length > MAX_JD_CHARS) {
    return {
      valid: false,
      error: `Job description is too long — ${trimmed.length.toLocaleString()} / ${MAX_JD_CHARS.toLocaleString()} characters.`,
    }
  }

  return { valid: true }
}

export const JD_MAX = MAX_JD_CHARS
export const JD_MIN = MIN_JD_CHARS
