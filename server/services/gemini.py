import json
import os
import re

from dotenv import find_dotenv, load_dotenv
from google import genai
from google.genai import types


load_dotenv(find_dotenv(usecwd=True))

MODEL_DEFAULT = "gemini-2.5-flash"
DISCLAIMER = (
    "This is decision support only -- not a hiring decision. Based on "
    "peer-reviewed research on algorithmic bias in recruitment. Always "
    "combine with human judgment."
)

_client = None


class GeminiConnectionError(Exception):
    pass


class GeminiParseError(Exception):
    pass


def get_api_key():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiConnectionError("GEMINI_API_KEY is missing. Add it to your .env file.")
    return api_key


def get_model_name():
    return os.getenv("MODEL_NAME", MODEL_DEFAULT)


def get_client():
    global _client
    if _client is None:
        _client = genai.Client(
            api_key=get_api_key(),
            http_options=types.HttpOptions(clientArgs={"trust_env": False}),
        )
    return _client


def build_resume_analysis_prompt(resume_text, job_description):
    return f"""
You are an expert ATS (Applicant Tracking System) simulator and recruitment bias auditor with knowledge of algorithmic discrimination research.

You will receive:
1. RESUME TEXT -- plain text extracted from a candidate's resume
2. JOB DESCRIPTION -- the job posting they are applying for

Your tasks:
1. Simulate how an ATS would parse and score this resume against the job description
2. Identify keyword gaps between the resume and job description
3. Detect bias signals -- resume elements that could trigger unfair automated filtering based on proxy discrimination research

Bias signal rules:
- graduation_year proxies for age. Severity: medium. Research basis: Kochling & Wehner (2020).
- foreign_name proxies for ethnicity or national origin. Severity: high. Research basis: Mehrabi et al. (2021).
- home_address proxies for socioeconomic status. Severity: low. Research basis: Raghavan et al. (2020).
- employment_gap proxies for disability or caregiving. Severity: medium. Research basis: Glazko et al. (2024).
- disability_language proxies for disability status. Severity: high. Research basis: Glazko et al. (2024).
- photo_reference proxies for gender, ethnicity, or age. Severity: high. Research basis: Bogen & Rieke (2018).
- university_prestige proxies for socioeconomic class. Severity: low. Research basis: Raghavan et al. (2020).
- gendered_language proxies for gender. Severity: medium. Research basis: Kochling & Wehner (2020).

Return ONLY a valid JSON object with this exact structure:

{{
  "ats_score": <integer 0-100>,
  "ats_simulation": {{
    "likely_passed": <boolean>,
    "reasoning": <string, 1-2 sentences>
  }},
  "extracted_entities": {{
    "skills": [<skills found in resume>],
    "education": [{{ "degree": "", "institution": "", "year": "" }}],
    "experience": [{{ "title": "", "company": "", "duration": "" }}]
  }},
  "keyword_gaps": {{
    "hard_skills": [<hard skills in JD not in resume>],
    "soft_skills": [<soft skills in JD not in resume>],
    "certifications": [<certs in JD not in resume>]
  }},
  "bias_signals": [
    {{
      "type": <one of: graduation_year | foreign_name | home_address | employment_gap | disability_language | photo_reference | university_prestige | gendered_language>,
      "severity": <"low" | "medium" | "high">,
      "excerpt": <the exact text that triggered this flag>,
      "explanation": <plain English: why this is a bias risk for this candidate>,
      "research_basis": <relevant academic citation from algorithmic bias research>
    }}
  ],
  "suggestions": [<specific, actionable suggestions -- not generic advice>],
  "disclaimer": "{DISCLAIMER}"
}}

RESUME TEXT:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON. No markdown formatting, no code blocks, no text outside the JSON object.
""".strip()


def clean_json_response(response_text):
    text = response_text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_gemini_json(response_text):
    cleaned = clean_json_response(response_text)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as error:
        raise GeminiParseError("Gemini returned invalid JSON.") from error

    if not isinstance(parsed, dict):
        raise GeminiParseError("Gemini response must be a JSON object.")

    parsed.setdefault("disclaimer", DISCLAIMER)
    return parsed


def analyze_resume_with_gemini(resume_text, job_description):
    try:
        client = get_client()
    except GeminiConnectionError:
        raise

    prompt = build_resume_analysis_prompt(resume_text, job_description)

    try:
        response = client.models.generate_content(
            model=get_model_name(),
            contents=prompt,
        )
    except Exception as error:
        raise GeminiConnectionError("Gemini API call failed.") from error

    if not response.text:
        raise GeminiConnectionError("Gemini returned an empty response.")

    return parse_gemini_json(response.text)


def test_gemini_connection():
    try:
        client = get_client()
        response = client.models.generate_content(
            model=get_model_name(),
            contents="Return only the word ok.",
        )
        return {"status": "ok", "response": response.text.strip()}
    except Exception as error:
        raise GeminiConnectionError("Gemini connection test failed.") from error
