from flask import Flask, request, jsonify, render_template
import pdfplumber
import google.generativeai as genai
from flask_cors import CORS
import json
import re
import os

app=Flask(__name__)
CORS(app)