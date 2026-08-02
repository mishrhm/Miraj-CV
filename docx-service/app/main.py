from typing import Optional

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.resume_template import build_resume_docx

app = FastAPI(title="miraj-cv-docx-service")


class Contact(BaseModel):
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class Experience(BaseModel):
    organization: str
    title: str
    location: Optional[str] = None
    startDate: str
    endDate: Optional[str] = None
    bullets: list[str] = []


class EducationEntry(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    endDate: Optional[str] = None


class ResumeRequest(BaseModel):
    fullName: str
    headline: Optional[str] = None
    contact: Contact
    summary: Optional[str] = None
    experiences: list[Experience] = []
    skills: list[str] = []
    education: list[EducationEntry] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/render-resume")
def render_resume(payload: ResumeRequest):
    """
    Deterministic rendering endpoint. Takes structured tailored-resume data
    (already produced by the Claude tailoring stage in the web app) and
    returns a .docx file. This endpoint does NOT call any LLM — it only
    lays out data it's given, which is what makes the output reliably
    submittable without a review pass.
    """
    buffer = build_resume_docx(payload.model_dump())
    filename = f"{payload.fullName.replace(' ', '_')}_Resume.docx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
