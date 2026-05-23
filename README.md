<div align="center">

# RecruitLens

**Know what the algorithm sees.**

ATS simulation · Algorithmic bias detection · Research-backed

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4.svg)](https://ai.google.dev/)

</div>

---

## What is RecruitLens?

RecruitLens is an AI-powered tool that shows job seekers exactly how an Applicant Tracking System (ATS) processes their resume — and flags resume elements that peer-reviewed research identifies as proxies for protected characteristics.

Most ATS systems are black boxes. Candidates submit resumes without knowing whether they'll survive automated keyword filtering, and without knowing that completely neutral elements — their name, their address, their graduation year — can cause an algorithm to silently filter them out before a human ever reads their application.

RecruitLens makes that process transparent.

Upload a resume and a job description. In seconds, you get:

- An **ATS score** (0–100) simulating keyword and skills matching
- A **pass / fail prediction** with plain-English reasoning
- **Extracted entities** — what an ATS actually sees: skills, education, experience
- **Keyword gaps** — hard skills, soft skills, and certifications missing from your resume
- **Bias signal detection** — 8 research-backed proxy discrimination patterns flagged with citations
- **Actionable suggestions** — specific rewrites, not generic advice

---

## Screenshots

<img src="/docs/Landing.png" alt="RecruitLens logo" width="300" height="620" />
<img src="/docs/Analyze.png" alt="RecruitLens logo" width="300" height="620" />
<img src="/docs/Research.png" alt="RecruitLens logo" width="300" height="620" />

</br>

---

## The Research

This tool is the practical implementation of a peer-reviewed study published in **REVIZOR — Journal for Organization Management, Finance and Audit**.

> **Pavlović, M., Glišović, L., & Mirčetić, V.** (2026). _Uticaj veštačke inteligencije na savremene prakse regrutacije i selekcije_ [The Impact of Artificial Intelligence on Contemporary Recruitment and Selection Practices]. _REVIZOR, 28_(4). https://doi.org/10.46793/Rev25112.091P

The paper documents how AI recruitment systems perpetuate historical discrimination through **proxy bias** — using seemingly neutral data points as stand-ins for protected characteristics. It identifies 8 specific patterns, each grounded in independent algorithmic bias research:

| Signal              | Proxies for                 | Severity | Source                   |
| ------------------- | --------------------------- | -------- | ------------------------ |
| Graduation year     | Age                         | Medium   | Köchling & Wehner (2020) |
| Foreign name        | Ethnicity / national origin | **High** | Mehrabi et al. (2021)    |
| Home address        | Socioeconomic status        | Low      | Raghavan et al. (2020)   |
| Employment gap      | Disability or caregiving    | Medium   | Glazko et al. (2024)     |
| Disability language | Disability status           | **High** | Glazko et al. (2024)     |
| Photo reference     | Gender, ethnicity, age      | **High** | Bogen & Rieke (2018)     |
| University prestige | Socioeconomic class         | Low      | Raghavan et al. (2020)   |
| Gendered language   | Gender                      | Medium   | Köchling & Wehner (2020) |

RecruitLens detects all 8. Every flagged result includes the triggering excerpt, a plain-English explanation, and the academic citation — making the analysis fully transparent and explainable.

---

## Tech Stack

| Layer            | Technology                                                      |
| ---------------- | --------------------------------------------------------------- |
| Frontend         | React 18 · Vite 5 · React Router v6                             |
| Backend          | Python 3.11 · FastAPI · Uvicorn                                 |
| AI               | Google Gemini 2.5 Flash                                         |
| Document parsing | pdfplumber · python-docx                                        |
| Security         | Magic-byte file validation · CSP headers · CORS · Rate limiting |
| Hosting          | Vercel (frontend) · Render (backend)                            |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Google AI Studio](https://aistudio.google.com/) API key (free tier: 1,500 req/day)

### 1. Clone

```bash
git clone https://github.com/matejapp/recruit-lens.git
cd recruit-lens
```

### 2. Backend

```bash
cd server
pip install -r requirements.txt
```

Create `server/.env`:

```env
GEMINI_API_KEY=your_api_key_here
MODEL_NAME=gemini-2.5-flash
ALLOWED_ORIGIN=http://localhost:5173
```

Start the server:

```bash
uvicorn main:app --reload
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
# App running at http://localhost:5173
```

---

## Deployment

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_URL = https://your-app.onrender.com`
4. Deploy — Vercel auto-detects Vite

### Backend → Render

The repo includes a `render.yaml` Blueprint. On [render.com](https://render.com):

1. **New → Blueprint** → connect this repo
2. Set two environment variables manually in the dashboard:
   - `GEMINI_API_KEY` — your Google AI Studio key
   - `ALLOWED_ORIGIN` — your Vercel deployment URL

No Docker required — Render runs the FastAPI server natively.

> **Note:** Render's free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds. The frontend's 90-second timeout handles this gracefully.

---

## Privacy

RecruitLens is **stateless by design**. No resume data, job description text, or analysis results are stored, logged, or persisted anywhere. Every request is fully isolated and processed in memory only.

---

## Disclaimer

RecruitLens is decision support — not a hiring decision. All findings are based on peer-reviewed research on algorithmic bias in recruitment. Results should always be combined with human judgment.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">
  <sub>Built on research published in REVIZOR Journal · Faculty of Applied Management, Economics and Finance · University Business Academy in Novi Sad</sub>
</div>
