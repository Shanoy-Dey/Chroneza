from flask import Flask,send_file, request, jsonify, render_template
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime

app = Flask(__name__,static_folder='static')

# If you installed Tesseract manually, specify path:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def normalize_date(date_str):
    """Convert date to YYYY-MM-DD format."""
    for fmt in ("%d %B %Y", "%d %b %Y", "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except:
            continue
    return date_str


def extract_exam_data(image_path):
    """Run OCR and extract subjects + dates."""
    img = cv2.imread(image_path)

    # Convert to grayscale and apply threshold for better OCR
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    # OCR text extraction
    text = pytesseract.image_to_string(gray)
    print("OCR Raw Output:\n", text)

    # Clean and process text
    text = text.replace('—', '-').replace('–', '-')
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    pattern = r'([A-Za-z\s]+)[-:\s]+(\d{1,2}\s*[A-Za-z]+\s*\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})'
    data = []

    for line in lines:
        match = re.search(pattern, line)
        if match:
            subject = match.group(1).strip()
            date_str = normalize_date(match.group(2).strip())
            data.append({"subject": subject, "date": date_str})

    return data


@app.route('/')
def home():
     return send_file("create.html")  # your HTML page


@app.route('/upload', methods=['POST'])
def upload():
    """Handles uploaded timetable image."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Save temporarily
    path = 'temp_image.jpg'
    file.save(path)

    # Extract exam data
    data = extract_exam_data(path)
    return jsonify({'exams': data})


if __name__ == '__main__':
    app.run(debug=True)
