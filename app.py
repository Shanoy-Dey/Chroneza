from flask import Flask, request, jsonify, send_file
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
from collections import Counter # FIX: Added Counter to imports
import os

# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/bin/tesseract' 

app = Flask(__name__, static_folder='static')

# ---------------- HELPER: Normalize Date ---------------- #
def normalize_date(date_str):
    """Try to parse and convert a date into DD-MM-YYYY format."""
    date_formats = [
        "%d %B %Y", "%d %b %Y",
        "%d %B %y", "%d %b %y",
        "%B %d %Y", "%b %d %Y",
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", 
        "%d/%m/%y", "%d-%m-%y", "%d.%m.%y",
        "%m/%d/%Y", "%m-%d-%Y", "%m.%d.%Y", 
        "%Y-%m-%d"
    ]
    cleaned = (
        date_str.strip()
        .replace(",", "")
        .replace("rd", "")
        .replace("st", "")
        .replace("th", "")
        .replace("nd", "")
    )
    for fmt in date_formats:
        try:
            return datetime.strptime(cleaned, fmt).strftime("%d-%m-%Y") # FIX: Output date as day-month-year.
        except ValueError:
            continue
            
    return date_str

# ---------------- CORE OCR EXTRACTOR ---------------- #
def extract_exam_data(np_array):
    """Extract subject-date pairs from an exam timetable image."""
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image array.")

    # --- STEP 1: Preprocess image for better OCR --- #
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # FIX: Using the more effective adaptive thresholding logic from the previous successful iteration
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, processed_img = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU) 

    # --- STEP 2: Run OCR --- #
    # FIX: Reverting PSM to 3. PSM 4/6 might be too specific and cause Hindi/Social Studies to be missed.
    # We will rely on robust cleanup (Step 3/5) to handle the noise.
    custom_config = r'--psm 3' 
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    print("\n🔹 RAW OCR OUTPUT:\n", text)

    # --- STEP 3: Clean text --- #
    text = (
        text.replace("—", "-")
        .replace("–", "-")
        .replace("|", "I")
        .replace(":", " ")
    )
    # FIX: Relaxing this aggressive character filter, which might have been removing valid punctuation needed for subject recognition
    # text = re.sub(r"[^A-Za-z0-9/\-\n\s\.]", " ", text) 
    
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Remove header/footer garbage
    # FIX: Added 'day' and 'date' to filter out noise like 'Tuesday' and general calendar terms
    banned_words = [
        "school", "principal", "note", "controller", "examination", "session",
        "signature", "society", "tagore", "medium", "day", "date" 
    ]
    lines = [l for l in lines if not any(bad in l.lower() for bad in banned_words)]

    # --- STEP 4: Extract dates + subjects (Using the explicit date pattern) --- #
    # FIX: Using a more robust date pattern to ensure all parts of the subject are consumed by the date extraction.
    date_pattern = r"(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})"
    results = []
    
    # Pre-compile the date pattern for efficient searching
    date_regex = re.compile(date_pattern) 
    
    for i, line in enumerate(lines):
        # Find all date instances in the line
        for match in date_regex.finditer(line):
            raw_date = match.group(1)
            normalized_date = normalize_date(raw_date)
            
            # Extract subject by removing the specific date string
            subject = line.replace(raw_date, "").strip(" -:.")

            # If subject missing, take from previous line (This is a helpful recovery step)
            if not subject and i > 0:
                subject = lines[i - 1].strip()

            # Remove trailing noise like “Pd)” or extra dots
            subject = re.sub(r"\s*\([^\)]*\)", "", subject).strip()
            subject = re.sub(r"[\.\-–/]+$", "", subject).strip()
            
            # --- STEP 5: Smart Subject Corrections (Enhanced to remove noise) --- #
            
            # FIX: Added check to remove noise like 'aths TV'
            if re.match(r"tuesday|monday|wednesday|thursday|friday|saturday|sunday", subject, re.I) or re.search(r"tv|mishra|pd|aths", subject, re.I):
                continue # Skip line if it looks like a noise entry
            
            if re.match(r"indi", subject, re.I):
                subject = "Hindi"
            elif re.search(r"math", subject, re.I):
                subject = "Maths"
            elif re.search(r"sci|evs|environment", subject, re.I):
                subject = "Science / E.V.S"
            elif re.search(r"social|sst|geo|hist", subject, re.I):
                subject = "Social Studies"
            elif re.search(r"english.*lang", subject, re.I):
                subject = "English Language - I"
            elif re.search(r"english.*lit|gk|general", subject, re.I):
                subject = "English Literature - II / General Knowledge"
            elif re.search(r"sanskrit|bengali", subject, re.I):
                subject = "Bengali / Sanskrit"

            # FIX: Increased final length filter to aggressively remove incomplete/noise subjects
            if len(subject) > 4: 
                results.append({"subject": subject, "date": normalized_date})

    # --- STEP 6: Month consistency (prevent wrong 09-2025 jumps) --- #
    # This logic looks good for correcting month errors where September (09) is confused with November (11)
    for i in range(1, len(results)):
        try:
            prev_date = datetime.strptime(results[i - 1]["date"], "%d-%m-%Y")
            curr_date = datetime.strptime(results[i]["date"], "%d-%m-%Y")
            if curr_date.month < prev_date.month and prev_date.day < 25:
                corrected = curr_date.replace(month=prev_date.month)
                results[i]["date"] = corrected.strftime("%d-%m-%Y")
        except ValueError:
            # Handle cases where date strings might still be invalid
            continue


    # --- STEP 7: Detect & recover missing subjects --- #
    # This step is critical for catching subjects missed by the main loop.
    subjects_found = [d["subject"].lower() for d in results]
    needed_patterns = {
        "Hindi": r"indi",
        "Science / E.V.S": r"(sci|evs|environment)",
        "Social Studies": r"(social|sst|geo|hist)" # FIX: Added explicit recovery for Social Studies
    }

    for name, pat in needed_patterns.items():
        if not any(name.lower() in s for s in subjects_found):
            # Relaxed pattern search to catch the subject followed by a date, possibly with characters in between
            match = re.search(
                pat + r".{0,50}?" + date_pattern, # Increased the tolerance for characters between subject marker and date
                text,
                re.I | re.DOTALL # Added DOTALL to search across multiple lines if needed
            )
            if match:
                recovered_date = normalize_date(match.group(1))
                results.append({"subject": name, "date": recovered_date})

    # --- STEP 8: Deduplicate and Final Sort --- #
    final = []
    seen = set()
    # FIX: Added a deduplication step based on date only to filter out multiple subjects on the same line (like the Maths noise)
    # RETAIN ALL ENTRIES but ensure the subject names are unique per date.
    
    # Simple, non-aggressive deduplication
    for d in results:
        key = (d["subject"].lower(), d["date"])
        if key not in seen:
            seen.add(key)
            final.append(d)

    # Sort by date
    try:
        final.sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%Y"))
    except:
        pass

    return final


# ---------------- FLASK ROUTES ---------------- #
@app.route("/")
def home():
    return send_file("create.html")


@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        file_bytes = file.read()
        np_array = np.frombuffer(file_bytes, np.uint8)
        data = extract_exam_data(np_array)

        if not data:
            return jsonify({
                "exams": [],
                "warning": "No structured exam data could be extracted. Please ensure the image is clear and in Subject-Date format."
            })

        return jsonify({"exams": data})

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        return jsonify({"error": "Failed to process image data.", "details": str(e)}), 500


# ---------------- MAIN ---------------- #
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
