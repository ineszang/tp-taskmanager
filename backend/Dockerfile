FROM python:3.12@sha256:9c77cd423768fba7a2e6b156d4fac57354685742452d13c05203fb2406b9ffaf

RUN useradd -m appuser 
USER appuser

WORKDIR /app
COPY ./app/


RUN pip install -r requirements.txt
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost/health || exit 1


EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
