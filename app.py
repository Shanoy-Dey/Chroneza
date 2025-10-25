from flask import Flask, request, jsonify, send_file
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
import os

app = Flask(__name__, static_folder='static')

# --- Helper Functions ---

def normalize_date(date_str):
    """Convert date to YYYY-MM-DD format, trying various formats."""
    # Common date formats to attempt parsing
    date_formats = [
        "%d %B %Y", "%d %b %Y", "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", 
        "%B %d, %Y", "%b %d, %Y", "%Y-%m-%d" # Added more common formats
    ]
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return date_str # Return original if no format matches

def extract_exam_data(np_array):
    """
    Run OCR and extract subjects + dates from an image array using in-memory processing.
    """
    # 1. Decode the image from the numpy array in memory
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image array. The file may be corrupt or not a valid image.")

    # 2. Image Pre-processing for better OCR
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Use adaptive thresholding for better handling of uneven lighting
    thresh = cv2.adaptiveThreshold(
        gray, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 
        11, 
        2
    )
    
    # Optional: Noise reduction or mild dilation to connect broken characters
    kernel = np.ones((1, 1), np.uint8)
    processed_img = cv2.erode(thresh, kernel, iterations=1)
    processed_img = cv2.dilate(processed_img, kernel, iterations=1)
    
    # Ensure background is white and text is black (Tesseract preference)
    processed_img = cv2.bitwise_not(processed_img)

    # 3. OCR text extraction
    # Use page segmentation mode 6 (Assume a single uniform block of text)
    custom_config = r'--psm 6'
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    print("OCR Raw Output:\n", text)

    # 4. Clean and process text
    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ').replace(';', ' ')
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Regex Pattern: Capture 1) Subject Name and 2) Date
    # Date pattern is robust for various formats (e.g., 25 Oct 2025, 25/10/2025)
    date_pattern = r'(\d{1,2}[\s\./-]?\s*(?:[A-Za-z]{3,}\s*)?\d{2,4})'
    # Subject: A sequence of letters/spaces (at least 3 chars), followed by separator, then date
    pattern = r'([A-Za-z\s]{3,})\s*[-:\s]+\s*' + date_pattern
    
    data = []

    for line in lines:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            subject = match.group(1).strip()
            date_str = normalize_date(match.group(2).strip())
            
            # Simple check: Subject should not be purely numerical or too short
            if len(subject) > 3 and not subject.isdigit():
                data.append({"subject": subject, "date": date_str})

    return data

# --- Flask Routes ---

@app.route('/')
def home():
    # Serves the static HTML file
    return send_file("create.html") 


@app.route('/upload', methods=['POST'])
def upload():
    """Handles uploaded timetable image using in-memory processing."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Read the file data into a bytes buffer
        file_bytes = file.read()
        
        # Convert file bytes to a numpy array for cv2.imdecode
        np_array = np.frombuffer(file_bytes, np.uint8)

        # Extract exam data from the in-memory array
        data = extract_exam_data(np_array)
        
        if not data:
            # If data is empty, return a successful response but warn the user
            return jsonify({'exams': [], 'warning': 'No exam data could be extracted. Please ensure the text is clear.'})

        return jsonify({'exams': data})

    except Exception as e:
        print(f"An error occurred during processing: {e}")
        # Return a 500 status code for internal server error
        return jsonify({'error': 'Failed to process image data.', 'details': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # This is for local running; Gunicorn is used on Render
    app.run(debug=True, host='0.0.0.0', port=port)
