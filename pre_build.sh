#!/bin/bash

# ----------------------------
# pre_build.sh for Render
# ----------------------------

# 1. Upgrade pip, setuptools, wheel to latest versions
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# 2. Optional: check Python version
echo "Python version:"
python --version

# 3. Optional: check pip version
echo "Pip version:"
pip --version

# 4. Install required system dependencies (if needed)
# For pytesseract and OpenCV, ensure tesseract is installed on the system
# Render free tier may already have most libraries, but you can add apt-get commands if using Render's Build environment
# Example (uncomment if needed):
# sudo apt-get update
# sudo apt-get install -y tesseract-ocr libgl1-mesa-glx libglib2.0-0

# 5. Install Python packages from requirements.txt
echo "Installing Python packages..."
pip install -r requirements.txt

echo "Pre-build steps completed!"

