"""
Configuración de Celery para tareas asincrónicas
"""
import os
from celery import Celery
from celery.schedules import crontab

# Configurar Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinica.settings')

app = Celery('clinica')

# Cargar configuración desde Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-descubrir tareas en todas las apps
app.autodiscover_tasks()

# Tareas programadas (Celery Beat)
app.conf.beat_schedule = {
    # Generar reporte diario de atenciones
    'generate-daily-report': {
        'task': 'payments.tasks.generate_daily_report',
        'schedule': crontab(hour=18, minute=0),  # 6 PM todos los días
    },
    # Limpiar logs antiguos semanalmente
    'cleanup-old-logs': {
        'task': 'payments.tasks.cleanup_old_logs',
        'schedule': crontab(day_of_week=0, hour=2, minute=0),  # Domingos a las 2 AM
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
