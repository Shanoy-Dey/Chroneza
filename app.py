from flask import Flask, request, jsonify, send_file
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
from collections import Counter
import os

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
            return datetime.strptime(cleaned, fmt).strftime("%d-%m-%Y")
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
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    gray = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )
    kernel = np.ones((2, 2), np.uint8)
    gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)

    # --- STEP 2: Run OCR --- #
    text = pytesseract.image_to_string(gray, config="--psm 4")

    print("\n🔹 RAW OCR OUTPUT:\n", text)

    # --- STEP 3: Clean text --- #
    text = (
        text.replace("—", "-")
        .replace("–", "-")
        .replace("|", "I")
        .replace(":", " ")
    )
    text = re.sub(r"[^A-Za-z0-9/\-\n\s\.]", " ", text)
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Remove header/footer garbage
    banned_words = [
        "school", "principal", "note", "controller", "examination", "session",
        "signature", "society", "tagore", "medium"
    ]
    lines = [l for l in lines if not any(bad in l.lower() for bad in banned_words)]

    # --- STEP 4: Extract dates + subjects --- #
    date_pattern = r"\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}"
    results = []
    for i, line in enumerate(lines):
        for match in re.finditer(date_pattern, line):
            raw_date = match.group()
            normalized_date = normalize_date(raw_date)
            subject = line.replace(raw_date, "").strip(" -:.")

            # If subject missing, take from previous line
            if not subject and i > 0:
                subject = lines[i - 1].strip()

            # Remove trailing noise like “Pd)” or extra dots
            subject = re.sub(r"\s*\([^\)]*\)", "", subject)
            subject = re.sub(r"[\.\-–/]+$", "", subject).strip()

            # --- STEP 5: Smart Subject Corrections --- #
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

            if len(subject) > 2:
                results.append({"subject": subject, "date": normalized_date})

    # --- STEP 6: Month consistency (prevent wrong 09-2025 jumps) --- #
    for i in range(1, len(results)):
        prev_date = datetime.strptime(results[i - 1]["date"], "%d-%m-%Y")
        curr_date = datetime.strptime(results[i]["date"], "%d-%m-%Y")
        if curr_date.month < prev_date.month and prev_date.day < 25:
            corrected = curr_date.replace(month=prev_date.month)
            results[i]["date"] = corrected.strftime("%d-%m-%Y")

    # --- STEP 7: Detect & recover missing subjects --- #
    subjects_found = [d["subject"].lower() for d in results]
    needed_patterns = {
        "Hindi": r"indi",
        "Science / E.V.S": r"(sci|evs|environment)"
    }

    for name, pat in needed_patterns.items():
        if not any(name.lower() in s for s in subjects_found):
            match = re.search(
                pat + r".{0,25}?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})",
                text,
                re.I
            )
            if match:
                recovered_date = normalize_date(match.group(1))
                results.append({"subject": name, "date": recovered_date})

    # --- STEP 8: Deduplicate --- #
    final = []
    seen = set()
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
