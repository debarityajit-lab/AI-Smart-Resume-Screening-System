from flask import Flask, request, jsonify, render_template
import pdfplumber
import google.generativeai as genai
from flask_cors import CORS
import json
import re
import os

app=Flask(__name__)
CORS(app)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY","YOUR_API_KEY"))
model=genai.GenerativeModel("gemini-1.5-flash")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok"})

def extract_text_from_pdf(file) -> str:
    """Extract all text from an uploaded PDF file."""
    text=""
    try:
        with pdfplumber.open(file)as pdf:
            for page in pdf.pages:
                page_text=page.extract_text()
                if page_text:
                    text+=page_text+"\n"
    except Exception as e:
        raise ValueError(f"Could not read PDF: {e}")
    return text.strip()

def build_prompt(resume_text: str, job_description: str="") -> str:
    """Build a structured prompt that asks Gemini to return clean JSON."""
    jd_block=""
    if job_description:
        jd_block=f"""
Job Description provided:
\"\"\"
{job_description}
\"\"\"
Also identify skills mentioned in the job description that are MISSING from the resume.
"""
        return f"""
You are an expert resume reviewer and HR specialist.
Analyze the resume below and respond ONLY with a valid JSON object-no markdown fences, no extra text.
The JSON must have exactly these keys:
{{
  "candidate_name": "<full name extracted from resume, or 'Unknown Candidate' if not found>",
  "score": <integer 0-100>,
  "score_reason": "<one sentence explaining the score>",
  "skills": ["skill1","skill2",...],
  "missing_skills": ["skill1",...],
  "experience_years": <integer or null>,
  "education": "<highest degree and field, e.g. B.Tech Computer Science>",
  "suggestions": [
   "Specific, actionable suggestion 1",
   "Specific, actionable suggestion 2"
  ]
}}

Rules:
-  "score": integer only, based on clarity, impact, quantification, formatting, ATS-friendliness, and fit with job description if provided.
-  "candidate_name": extract from the top of the resume.
-  "skills": list every technical and soft skill you can detect.
-  "missing_skills": skills from the job description not found in resume (empty array if no JD given).
-  "experience_years": total years of work experience as an integer, or null if unclear.
-  "education": highest qualification found, or "Not specified".
-  "suggestions": 4-6 concrete, specific improvement tips (not vague advice).
-  Return ONLY the JSON. No markdown. No explanation outside the JSON.
{jd_block}
Resume:
\"\"\"
{resume_text}
\"\"\"
"""

def safe_parse_json(raw: str) -> dict:
    """Parse JSON from Gemini's response, strippin any accidental markdown fences."""
    raw=raw.strip()
    raw=re.sub(r"^```(?:json)?", "", raw, flags=re.IGNORECASE).strip()
    raw=re.sub(r"```$", "", raw).strip()
    return json.loads(raw)