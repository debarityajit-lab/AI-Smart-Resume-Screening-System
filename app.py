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