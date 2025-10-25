from flask import Flask, request, jsonify, send_file
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
import os

# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/bin/tesseract' 

app = Flask(__name__, static_folder='static')

def normalize_date(date_str):
    date_formats = [
        "%d %B %Y", "%d %b %Y",
        "%d %B %y", "%d %b %y",
        "%B %d %Y", "%b %d %Y",
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", 
        "%d/%m/%y", "%d-%m-%y", "%d.%m.%y",
        "%m/%d/%Y", "%m-%d-%Y", "%m.%d.%Y", 
        "%Y-%m-%d"
    ]
    cleaned_str = re.sub(r'(\s+)', ' ', date_str.strip()).replace(',', '').replace('rd', '').replace('st', '').replace('th', '').replace('nd', '')
    
    for fmt in date_formats:
        try:
            return datetime.strptime(cleaned_str, fmt).strftime("%d-%m-%Y") # FIX: Output date as day-month-year.
        except ValueError:
            continue
            
    return date_str

def extract_exam_data(np_array):
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image array. The file may be corrupt or not a valid image.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    custom_config = r'--psm 6'
    text = pytesseract.image_to_string(thresh, config=custom_config)

    # Basic cleanup
    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ').replace(';', ' ')
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # --- Merge split lines if next line looks like date ---
    merged_lines = []
    i = 0
    while i < len(lines):
        if i + 1 < len(lines) and re.search(r'\d{1,2}[-/.\s]\d{1,2}[-/.\s]\d{2,4}', lines[i + 1]):
            merged_lines.append(lines[i] + " " + lines[i + 1])
            i += 2
        else:
            merged_lines.append(lines[i])
            i += 1

    # Patterns
    date_pattern = r'(\d{1,2}[\s\./-]?\s*(?:[A-Za-z]{3,}\s*)?\d{1,2}[\s\./-]?\s*\d{2,4})'
    subject_pattern = r'([A-Za-z0-9\s/&()\-\.]{3,})'
    subject_first = re.compile(subject_pattern + r'[\s\./-:]+' + date_pattern, re.IGNORECASE)
    date_first = re.compile(date_pattern + r'[\s\./-:]+' + subject_pattern, re.IGNORECASE)

    data = []
    for line in merged_lines:
        match = subject_first.search(line) or date_first.search(line)
        if not match:
            continue

        if subject_first.search(line):
            subject = match.group(1).strip()
            date_str = match.group(2).strip().replace('.', '/')
        else:
            date_str = match.group(1).strip().replace('.', '/')
            subject = match.group(2).strip()

        # --- Clean subject ---
        subject = re.sub(r'\s*\([^\)]*\)', '', subject).strip()
        subject = re.sub(r'[\s\.\-/]*$', '', subject).strip()

        # --- Fix for Hindi ---
        if subject.lower().startswith("indi"):
            subject = "Hindi"

        # --- Normalize Date ---
        normalized_date = normalize_date(date_str)

        # --- Filter unwanted noise like 'Principal' or too short subjects ---
        banned_words = ["principal", "note", "sign", "exam", "school", "head", "controller"]
        if (
            normalized_date != date_str
            and len(subject) > 4
            and not subject.isdigit()
            and not any(bad in subject.lower() for bad in banned_words)
        ):
            data.append({"subject": subject, "date": normalized_date})

    # --- Post-fix for missed pairs (like Social Studies) ---
    # Try to find "Social Studies" in text even if no date was parsed
    if not any("Social" in d["subject"] for d in data):
        social_match = re.search(r'Social\s+Studies[^\n]*?(\d{1,2}[-/.\s]\d{1,2}[-/.\s]\d{2,4})', text, re.IGNORECASE)
        if social_match:
            ss_date = normalize_date(social_match.group(1))
            data.append({"subject": "Social Studies", "date": ss_date})

    return data



@app.route('/')
def home():
    return send_file("create.html") 


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        file_bytes = file.read()
        np_array = np.frombuffer(file_bytes, np.uint8)

        data = extract_exam_data(np_array)
        
        if not data:
            return jsonify({'exams': [], 'warning': 'No structured exam data could be extracted. Please ensure the text is clear and follows a Subject-Date format.'})

        return jsonify({'exams': data})

    except Exception as e:
        print(f"An error occurred during processing: {e}")
        return jsonify({'error': 'Failed to process image data.', 'details': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
