from typing import Literal

from pydantic import BaseModel


class BiasSignal(BaseModel):
    type: str
    severity: Literal["low", "medium", "high"]
    excerpt: str
    explanation: str
    research_basis: str


class ATSSimulation(BaseModel):
    likely_passed: bool
    reasoning: str


class ExtractedEntities(BaseModel):
    skills: list[str]
    education: list[dict]
    experience: list[dict]


class KeywordGaps(BaseModel):
    hard_skills: list[str]
    soft_skills: list[str]
    certifications: list[str]


class AnalysisResponse(BaseModel):
    ats_score: int
    ats_simulation: ATSSimulation
    extracted_entities: ExtractedEntities
    keyword_gaps: KeywordGaps
    bias_signals: list[BiasSignal]
    suggestions: list[str]
    disclaimer: str
