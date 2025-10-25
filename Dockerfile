# Use a Python base image (adjust version as needed)
FROM python:3.10-slim

# Install Tesseract OCR and its dependencies
# CRITICAL FIX for TesseractNotFoundError
# CRITICAL FIX for libGL.so.1 (OpenCV) 👈 NEW LINE ADDED
RUN apt-get update && \
    apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1-mesa-glx \ 
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/app

# Copy the requirements file and install Python dependencies
COPY requirements.txt ./
# Ensure all packages, including opencv-python, are listed in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Define the command to run your application (e.g., Gunicorn for Flask)
CMD ["gunicorn", "app:app"]