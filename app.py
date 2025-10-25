from flask import Flask, request, jsonify, send_file
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
import os

# Set Tesseract command path if necessary (especially for Render/Linux environments)
# If Tesseract is not found, uncomment and adjust the path:
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/bin/tesseract' 

app = Flask(__name__, static_folder='static')

# --- Helper Functions ---

def normalize_date(date_str):
    """Convert date to YYYY-MM-DD format, trying various formats."""
    # Common date formats to attempt parsing, prioritized by completeness
    date_formats = [
        # Full date formats (e.g., 3 November 2025, 3 Nov 25)
        "%d %B %Y", "%d %b %Y",
        "%d %B %y", "%d %b %y",
        "%B %d %Y", "%b %d %Y", # Month Day Year (e.g., November 3 2025)

        # Standard formats (e.g., 03/11/2025, 03.11.25)
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", 
        "%d/%m/%y", "%d-%m-%y", "%d.%m.%y", # ADDED: 2-digit year formats for robustness
        
        # Month/day/year formats
        "%m/%d/%Y", "%m-%d-%Y", "%m.%d.%Y", 
        "%Y-%m-%d"
    ]
    # Clean up the string to remove extraneous commas/spaces/ordinal suffixes like 'rd'
    cleaned_str = re.sub(r'(\s+)', ' ', date_str.strip()).replace(',', '').replace('rd', '').replace('st', '').replace('th', '').replace('nd', '')
    
    for fmt in date_formats:
        try:
            # Use strict parsing
            return datetime.strptime(cleaned_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
            
    return date_str # Return original if no format matches

def extract_exam_data(np_array):
    """
    Run OCR and extract subjects + dates from an image array using in-memory processing.
    Includes enhanced preprocessing for low-quality images.
    """
    # 1. Decode the image from the numpy array in memory
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image array. The file may be corrupt or not a valid image.")

    # 2. Image Pre-processing for better OCR on low-quality images
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2a. Apply Gaussian Blur to smooth out high-frequency noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 2b. **MODIFIED** Use Otsu's thresholding for aggressive binarization
    # This works well when text is darker than background across the image.
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Invert the image if necessary (Tesseract prefers black text on white background)
    # Since Otsu's usually makes text black, we use the threshold output directly
    processed_img = thresh

    # 3. OCR text extraction
    # Using a less restrictive PSM might help capture more text
    custom_config = r'--psm 3' # PSM 3: Fully automatic page segmentation (better for complex layouts)
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    print("OCR Raw Output:\n", text)

    # 4. Clean and process text
    text = text.replace('—', '-').replace('–', '-').replace('|', 'I').replace(':', ' ').replace(';', ' ')
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Patterns for both directions (Subject-Date and Date-Subject)
    # Date pattern remains robust for DD.MM.YY format
    date_pattern = r'(\d{1,2}[\s\./-]?\s*(?:[A-Za-z]{3,}\s*)?\d{1,2}[\s\./-]?\s*\d{2,4})'
    
    # MODIFIED: Subject pattern now allows for numbers and parentheses common in exam names (e.g., 'Hindi (I - V)')
    subject_pattern = r'([A-Za-z0-9\s/&()\-\.]{3,})'

    # Subject-first regex: Subject [separator] Date
    subject_first = re.compile(subject_pattern + r'\s*[-:\s]+\s*' + date_pattern, re.IGNORECASE)
    # Date-first regex: Date [separator] Subject
    date_first = re.compile(date_pattern + r'\s*[-:\s]+\s*' + subject_pattern, re.IGNORECASE)

    data = []

    for line in lines:
        match = subject_first.search(line) or date_first.search(line)
        if match:
            # Determine the order of groups (subject is group 1 or 2)
            if subject_first.search(line):
                subject = match.group(1).strip()
                # REPLACE DOTS: Replace periods with slash to help standard date parsers
                date_str = match.group(2).strip().replace('.', '/') 
            else:
                # REPLACE DOTS: Replace periods with slash to help standard date parsers
                date_str = match.group(1).strip().replace('.', '/') 
                subject = match.group(2).strip()
            
            # Normalize the date using the updated format strings
            normalized_date = normalize_date(date_str)

            # Final check to ensure we got a valid subject/date pair
            # We rely on the JS filter for length, but ensure the date was actually normalized
            if normalized_date != date_str:
                data.append({"subject": subject, "date": normalized_date})

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
            return jsonify({'exams': [], 'warning': 'No structured exam data could be extracted. Please ensure the text is clear and follows a Subject-Date format.'})

        return jsonify({'exams': data})

    except Exception as e:
        print(f"An error occurred during processing: {e}")
        # Return a 500 status code for internal server error
        return jsonify({'error': 'Failed to process image data.', 'details': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Note: On Render, Gunicorn or a similar WSGI server is used.
    app.run(debug=True, host='0.0.0.0', port=port)
