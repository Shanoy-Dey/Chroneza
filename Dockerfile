# Start with a base Python image
FROM python:3.10-slim

# Install Tesseract OCR and its development files
# - apt-get update: Updates the list of packages
# - apt-get install: Installs the packages
# - tesseract-ocr: The Tesseract engine itself
# - libtesseract-dev: Development files (sometimes needed, good to include)
# - tesseract-ocr-eng: Language data for English
RUN apt-get update && \
    apt-get install -y tesseract-ocr libtesseract-dev tesseract-ocr-eng && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of your application code
COPY . .

# Specify the command to run your Python app
CMD ["python", "app.py"]