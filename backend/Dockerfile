FROM python:3.12

RUN useradd -m appuser 
USER appuser

WORKDIR /app
COPY ./app/


RUN pip install -r requirements.txt
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost/health || exit 1


EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
