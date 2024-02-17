FROM python:3.11
WORKDIR /app/epoch_backend/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
ENV DEPLOYMENT_ENV=VM
ENV DEPLOYED=true
ENV PYTHONUNBUFFERED=1
CMD ["python3", "main.py"]

