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
        raise ValueError("Could not decode image array.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    custom_config = r'--psm 6'
    text = pytesseract.image_to_string(thresh, config=custom_config)

    print("\n🔹 OCR Output:\n", text)

    # --- Basic cleanup ---
    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ')
    text = text.replace(';', ' ').replace('~', ' ')
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # --- Merge lines if next line is short (like part of subject) ---
    merged = []
    buffer = ""
    for line in lines:
        if re.search(r'\d{1,2}[-/.\s]\d{1,2}[-/.\s]\d{2,4}', line):
            # if line has date, push previous buffer
            if buffer.strip():
                merged.append(buffer.strip())
                buffer = ""
            merged.append(line)
        else:
            if len(line.split()) <= 3:  # probably continuation
                buffer += " " + line
            else:
                if buffer:
                    merged.append(buffer.strip())
                buffer = line
    if buffer:
        merged.append(buffer.strip())

    # --- Extract all date occurrences ---
    date_pattern = r'\d{1,2}[-/.\s]?\d{1,2}[-/.\s]?\d{2,4}'
    dates = []
    for i, line in enumerate(merged):
        for m in re.finditer(date_pattern, line):
            dates.append((i, m.group()))

    data = []
    for idx, raw_date in dates:
        normalized_date = normalize_date(raw_date)
        # Look backward for subject text near this line
        subject = ""
        search_back = 2  # Look up to 2 lines before date
        for j in range(idx, max(-1, idx - search_back), -1):
            candidate = merged[j]
            if not re.search(date_pattern, candidate):
                subject = candidate.strip()
                break

        # --- Clean subject ---
        subject = re.sub(r'\s*\([^\)]*\)', '', subject)
        subject = re.sub(r'[\.\-–/]+$', '', subject).strip()

        # --- Auto corrections ---
        if re.match(r'indi', subject, re.IGNORECASE):
            subject = "Hindi"
        if re.search(r'sci|evs', subject, re.IGNORECASE):
            subject = "E.V.S / Science"
        if re.search(r'social', subject, re.IGNORECASE):
            subject = "Social Studies"
        if re.search(r'lang', subject, re.IGNORECASE) and "English" in subject:
            subject = "English Language - I"
        if re.search(r'literature|gk|general knowledge', subject, re.IGNORECASE):
            subject = "English Literature - II / General Knowledge"

        banned = ["principal", "note", "head", "exam", "controller"]
        if subject and not any(bad in subject.lower() for bad in banned):
            data.append({"subject": subject, "date": normalized_date})

    # --- Deduplicate ---
    seen = set()
    unique_data = []
    for d in data:
        key = (d['subject'].lower(), d['date'])
        if key not in seen:
            unique_data.append(d)
            seen.add(key)

    return unique_data


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
