#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinica.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth.models import User
from payments.models import UserProfile

# Check if admin exists
if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser(
        username='admin',
        email='admin@odontall.com',
        password='Admin@1234'
    )
    # Create UserProfile
    UserProfile.objects.get_or_create(user=user, defaults={'role': 'admin'})
    print("✓ Admin user created successfully")
else:
    print("✓ Admin user already exists")
