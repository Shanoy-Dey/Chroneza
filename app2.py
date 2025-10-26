from flask import Flask, request, jsonify, send_file
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
from collections import Counter # FIX: Added Counter to imports
import os

app = Flask(__name__, static_folder='static')

@app.route("/")
def home():
    return send_file("create.html")

@app.route("/uploadtt", methods=["POST"])
def uploadtt():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    img=cv2.imread(file.stream)

    data=pytesseract.image_to_string(img)

    if not data:
        return jsonify({
            "exams": [],
            "warning": "No structured exam data could be extracted. Please ensure the image is clear and in Subject-Date format."
        })

    return jsonify({"exams": data})



# ---------------- MAIN ---------------- #
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
