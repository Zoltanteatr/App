FROM python:3.11

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY src/ src/

WORKDIR src/

CMD ["uvicorn", "--port", "8000", "--host", "0.0.0.0", "app:app"]
#CMD ["fastapi", "dev", "app.py", "--host", "0.0.0.0"]
