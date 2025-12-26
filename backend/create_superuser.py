#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinica.settings')
django.setup()

from django.contrib.auth.models import User

# Crear usuario admin si no existe
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@clinica.com',
        password='Inacap2025&'
    )
    print("✅ Usuario admin creado exitosamente")
else:
    print("ℹ️ Usuario admin ya existe")

# Crear usuario de prueba si no existe
if not User.objects.filter(username='test').exists():
    User.objects.create_user(
        username='test',
        email='test@clinica.com',
        password='test123456'
    )
    print("✅ Usuario de prueba creado")
else:
    print("ℹ️ Usuario de prueba ya existe")
