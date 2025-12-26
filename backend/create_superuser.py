#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinica.settings')
django.setup()

from django.contrib.auth.models import User

try:
    # Eliminar usuario admin si existe para recrearlo limpio
    User.objects.filter(username='admin').delete()
    print("🗑️ Usuario admin anterior eliminado")
    
    # Crear usuario admin nuevo
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@clinica.com',
        password='Inacap2025&'
    )
    print(f"✅ Usuario admin creado: {admin_user.username}")
    print(f"   Email: {admin_user.email}")
    print(f"   Es Staff: {admin_user.is_staff}")
    print(f"   Es Superuser: {admin_user.is_superuser}")

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
        
    print(f"✅ Total de usuarios en el sistema: {User.objects.count()}")
    
except Exception as e:
    print(f"❌ Error creando usuarios: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)


