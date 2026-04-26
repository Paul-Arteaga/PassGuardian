#!/bin/sh
# ============================================================
# PassGuardian - Entrypoint de producción
# Espera que MySQL esté listo antes de arrancar Django
# ============================================================

echo "⏳ Esperando que MySQL esté listo..."

# Espera activa hasta que Django pueda conectarse a la DB
until python manage.py migrate --noinput 2>&1; do
  echo "🔄 MySQL no está listo todavía, reintentando en 5 segundos..."
  sleep 5
done

echo "✅ Base de datos lista, migraciones aplicadas."

# Iniciar Gunicorn (servidor de producción)
# Ajusta 'backend.wsgi:application' si tu carpeta de settings se llama diferente
exec gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
