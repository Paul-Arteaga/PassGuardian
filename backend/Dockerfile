# ============================================================
# PassGuardian - Backend Dockerfile (PRODUCCIÓN)
# ============================================================

FROM python:3.11-slim

# Optimizaciones de Python para Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema para mysqlclient
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libmariadb-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Primero copiamos solo requirements para aprovechar caché de capas
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Instalamos gunicorn (servidor de producción)
RUN pip install gunicorn

# Copiamos el resto del código
COPY . /app/

# Script de entrada
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
