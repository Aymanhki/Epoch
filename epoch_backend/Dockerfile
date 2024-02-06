# Use the official Python image as a base image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory to the working directory
COPY . .

# Expose the port your application runs on
EXPOSE 8080
EXPOSE 8000

ENV DEPLOYMENT_ENV=VM
ENV PYTHONUNBUFFERED=1


# Command to run your application
CMD ["python3", "main.py"]

