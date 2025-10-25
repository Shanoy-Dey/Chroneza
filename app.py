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

    # --- STEP 1: Preprocess ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    gray = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )
    kernel = np.ones((2, 2), np.uint8)
    gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)

    # --- STEP 2: OCR (column layout) ---
    custom_config = r'--psm 4'
    text = pytesseract.image_to_string(gray, config=custom_config)

    print("\n🔹 OCR Raw Output:\n", text)

    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ')
    text = re.sub(r'[^A-Za-z0-9/\-\n\s\.]', ' ', text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # --- Remove clear noise lines (header/footer) ---
    banned_words = ['school', 'principal', 'note', 'controller', 'examination', 'session']
    lines = [l for l in lines if not any(bad in l.lower() for bad in banned_words)]

    # --- STEP 3: Find all dates ---
    date_pattern = r'\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}'
    all_data = []

    for i, line in enumerate(lines):
        for m in re.finditer(date_pattern, line):
            raw_date = m.group()
            normalized_date = normalize_date(raw_date)
            subject = line.replace(raw_date, '').strip()

            if not subject and i > 0:
                subject = lines[i - 1].strip()

            subject = re.sub(r'\s*\([^\)]*\)', '', subject)
            subject = re.sub(r'[\.\-–/]+$', '', subject).strip()

            # Smart name fixes
            if re.match(r'indi', subject, re.IGNORECASE):
                subject = "Hindi"
            elif re.search(r'math', subject, re.IGNORECASE):
                subject = "Maths"
            elif re.search(r'sci|evs', subject, re.IGNORECASE):
                subject = "E.V.S / Science"
            elif re.search(r'social', subject, re.IGNORECASE):
                subject = "Social Studies"
            elif re.search(r'english.*lang', subject, re.IGNORECASE):
                subject = "English Language - I"
            elif re.search(r'english.*lit|gk|general', subject, re.IGNORECASE):
                subject = "English Literature - II / General Knowledge"

            if len(subject) > 3:
                all_data.append({"subject": subject, "date": normalized_date})

    # --- STEP 4: Month consistency check (exclude unrelated 09/2025 etc.) ---
    # Find dominant month-year
    from collections import Counter
    if all_data:
        month_years = [d['date'][3:] for d in all_data if len(d['date']) >= 7]
        if month_years:
            common_month_year = Counter(month_years).most_common(1)[0][0]
            all_data = [d for d in all_data if d['date'][3:] == common_month_year]

    # --- STEP 5: Ensure all core subjects exist ---
    subjects_found = [d['subject'].lower() for d in all_data]
    needed = {
        "hindi": r"indi",
        "e.v.s / science": r"(sci|evs|environment)"
    }

    # Look for these in OCR text even if no date matched
    for sub_name, pat in needed.items():
        if not any(sub_name in s for s in subjects_found):
            m = re.search(pat + r".{0,25}?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})", text, re.IGNORECASE)
            if m:
                recovered_date = normalize_date(m.group(1))
                all_data.append({"subject": sub_name.title(), "date": recovered_date})

    # --- STEP 6: Deduplicate ---
    seen = set()
    final_data = []
    for d in all_data:
        key = (d['subject'].lower(), d['date'])
        if key not in seen:
            seen.add(key)
            final_data.append(d)

    return final_data


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
