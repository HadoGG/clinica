#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinica.settings')
django.setup()

from django.contrib.auth.models import User

try:
    # Crear usuario admin si no existe
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@clinica.com',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    
    if created:
        admin_user.set_password('Inacap2025&')
        admin_user.save()
        print("✅ Usuario admin creado exitosamente")
    else:
        # Actualizar contraseña si ya existe
        admin_user.set_password('Inacap2025&')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("ℹ️ Usuario admin actualizado")

    # Crear usuario de prueba si no existe
    test_user, created = User.objects.get_or_create(
        username='test',
        defaults={
            'email': 'test@clinica.com',
        }
    )
    
    if created:
        test_user.set_password('test123456')
        test_user.save()
        print("✅ Usuario de prueba creado")
    else:
        print("ℹ️ Usuario de prueba ya existe")
        
    print(f"✅ Total de usuarios: {User.objects.count()}")
    
except Exception as e:
    print(f"❌ Error creando usuarios: {e}")
    sys.exit(1)

