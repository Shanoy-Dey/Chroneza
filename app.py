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

    # --- STEP 1: Preprocess for cleaner OCR ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    gray = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )

    # Morphological open to remove small noise
    kernel = np.ones((2, 2), np.uint8)
    gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)

    # --- STEP 2: OCR using PSM 4 (column-like layout) ---
    custom_config = r'--psm 4'
    text = pytesseract.image_to_string(gray, config=custom_config)

    print("\n🔹 OCR Raw Output:\n", text)

    # --- STEP 3: Clean up ---
    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ')
    text = re.sub(r'[^A-Za-z0-9/\-\n\s\.]', ' ', text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Remove header/footer noise
    noise_words = ['school', 'principal', 'note', 'controller', 'examination', 'session']
    lines = [l for l in lines if not any(word in l.lower() for word in noise_words)]

    # --- STEP 4: Find all dates ---
    date_pattern = r'\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}'
    data = []
    for i, line in enumerate(lines):
        dates = re.findall(date_pattern, line)
        if dates:
            for date_str in dates:
                normalized_date = normalize_date(date_str)

                # Find possible subject near date
                subject = line.replace(date_str, '').strip()
                if not subject and i > 0:
                    subject = lines[i - 1].strip()

                # Clean subject
                subject = re.sub(r'\s*\([^\)]*\)', '', subject).strip()
                subject = re.sub(r'[\.\-–/]+$', '', subject).strip()

                # Keyword corrections
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
                    data.append({"subject": subject, "date": normalized_date})

    # --- STEP 5: Deduplicate & Final Filter ---
    seen = set()
    final_data = []
    for d in data:
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
