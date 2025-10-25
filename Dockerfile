# Use a Python base image (adjust version as needed, using a current slim version)
FROM python:3.11-slim 

# Install Tesseract OCR and its dependencies
# CRITICAL FIX for TesseractNotFoundError (tesseract-ocr)
# CRITICAL FIX for libGL.so.1 (OpenCV) using the simplified 'libgl1' package
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    # Using 'libgl1' instead of 'libgl1-mesa-glx' for slim base images:
    libgl1 \ 
    # Install an image processing dependency that is often useful
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libice6 \
    # Clean up apt caches to keep the image small
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/app

# Copy the requirements file and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Define the command to run your application
# Set a generous timeout (e.g., 60 seconds) for OCR operations
CMD ["gunicorn", "--timeout", "60", "app:app"]