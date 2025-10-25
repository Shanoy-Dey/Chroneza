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
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    processed_img = thresh

    custom_config = r'--psm 6' # FIX: Changed PSM to 6 (Assume a single uniform block of text) to help extract the first 'Hindi' entry.
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    print("OCR Raw Output:\n", text)

    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ').replace(';', ' ')
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    date_pattern = r'(\d{1,2}[\s\./-]?\s*(?:[A-Za-z]{3,}\s*)?\d{1,2}[\s\./-]?\s*\d{2,4})'
    subject_pattern = r'([A-Za-z0-9\s/&()\-\.]{3,})' 

    subject_first = re.compile(subject_pattern + r'[\s\./-:]+' + date_pattern, re.IGNORECASE)
    date_first = re.compile(date_pattern + r'[\s\./-:]+' + subject_pattern, re.IGNORECASE)
    data = []

    for line in lines:
        match = subject_first.search(line) or date_first.search(line)
        if match:
            if subject_first.search(line):
                subject = match.group(1).strip()
                date_str = match.group(2).strip().replace('.', '/') 
            else:
                date_str = match.group(1).strip().replace('.', '/') 
                subject = match.group(2).strip()
            
            subject = re.sub(r'(?i)\s*\([IVXLCDM\s\-]+\)', '', subject).strip()
            
            subject = re.sub(r'[.,\s]*$', '', subject).strip()
            
            normalized_date = normalize_date(date_str)

            if (
                normalized_date != date_str and 
                len(subject) > 3 and 
                not subject.isdigit()
            ):
                data.append({"subject": subject, "date": normalized_date})

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
