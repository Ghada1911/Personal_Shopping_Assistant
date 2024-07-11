# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Install dependencies
RUN pip install --upgrade pip
#RUN pip install openai

# Run openai migrate
#RUN openai migrat

# Set environment variables to ensure the output is sent straight to the terminal without buffering
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container
WORKDIR /app

# Install Tesseract OCR and other dependencies
RUN apt-get update && \
    apt-get install -y tesseract-ocr && \
    apt-get install -y libtesseract-dev && \
    apt-get install -y --no-install-recommends build-essential && \
    apt-get install -y --no-install-recommends libjpeg-dev zlib1g-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# Copy the requirements.txt file to the working directory
COPY requirements.txt /app/

# Install the dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . /app/

# Expose port 5000 for the Flask app
EXPOSE 5000

# Command to run the Flask app
CMD ["python", "app.py"]


