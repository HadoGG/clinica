from django.db.models.signals import post_save
from django.dispatch import receiver
from payments.models import Service, AuditLog
import json

# Signals loaded


@receiver(post_save, sender=Service, dispatch_uid="service_audit_signal")
def log_service_audit(sender, instance, created, **kwargs):
    """Registra cambios en Service"""
    
    if not created:
        return
    
    try:
        # Crear log de auditoría manualmente
        AuditLog.objects.create(
            user=None,
            action='create',
            model_name='Service',
            object_id=str(instance.id),
            object_description=f"Servicio: {instance.name}",
            new_values={
                'name': instance.name,
                'base_price': str(instance.base_price),
                'commission_percentage': str(instance.commission_percentage)
            }
        )
    except Exception as e:
        import traceback
        import sys
        print(f"Error in service audit signal: {e}", file=sys.stderr)
        traceback.print_exc()

