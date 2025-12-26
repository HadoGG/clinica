#!/bin/bash
# ================================
# Build script para Render
# ================================

set -e

echo "🔨 Instalando dependencias Python..."
pip install -r backend/requirements.txt

echo "🗄️  Ejecutando migraciones..."
cd backend
python manage.py migrate --noinput

echo "📦 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "✅ Build completado!"
