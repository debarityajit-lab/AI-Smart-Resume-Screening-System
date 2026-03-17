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