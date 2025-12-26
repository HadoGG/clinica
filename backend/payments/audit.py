"""
Utilidades para auditoría y registro de cambios en el sistema OdontAll
"""
from payments.models import AuditLog
from django.contrib.auth.models import User
import json


def log_audit(user, action, model_name, object_id, object_description='', 
              old_values=None, new_values=None, changes=None, request=None):
    """
    Registra una acción en el log de auditoría
    
    Args:
        user: Usuario que realiza la acción
        action: Tipo de acción ('create', 'update', 'delete', 'status_change', 'payment', 'settlement_generated')
        model_name: Nombre del modelo ('User', 'Professional', 'Service', 'Attention', 'Settlement', 'Discount')
        object_id: ID del objeto afectado
        object_description: Descripción del objeto
        old_values: Valores anteriores (dict)
        new_values: Valores nuevos (dict)
        changes: Cambios específicos (dict)
        request: Request object para obtener IP y User-Agent
    """
    try:
        ip_address = None
        user_agent = ''
        
        if request:
            # Obtener IP real (considerando proxies)
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Convertir dicts a JSON si es necesario
        old_values_json = json.dumps(old_values) if old_values and isinstance(old_values, dict) else old_values
        new_values_json = json.dumps(new_values) if new_values and isinstance(new_values, dict) else new_values
        changes_json = json.dumps(changes) if changes and isinstance(changes, dict) else changes
        
        audit_log = AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id),
            object_description=object_description,
            old_values=old_values_json,
            new_values=new_values_json,
            changes=changes_json,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return audit_log
    except Exception as e:
        print(f"Error logging audit: {e}")
        return None


def get_changed_fields(old_instance, new_instance, exclude_fields=None):
    """
    Compara dos instancias de modelo y retorna los cambios
    
    Args:
        old_instance: Instancia anterior (antes de cambios)
        new_instance: Instancia nueva (después de cambios)
        exclude_fields: Lista de campos a ignorar
    
    Returns:
        dict con cambios: {'field': {'old': value, 'new': value}}
    """
    if exclude_fields is None:
        exclude_fields = ['updated_at', 'created_at', 'id', 'pk']
    
    changes = {}
    old_dict = {}
    new_dict = {}
    
    # Convertir modelos a dicts
    if hasattr(old_instance, '__dict__'):
        old_dict = {k: v for k, v in old_instance.__dict__.items() 
                   if not k.startswith('_') and k not in exclude_fields}
    
    if hasattr(new_instance, '__dict__'):
        new_dict = {k: v for k, v in new_instance.__dict__.items() 
                   if not k.startswith('_') and k not in exclude_fields}
    
    # Detectar cambios
    all_keys = set(old_dict.keys()) | set(new_dict.keys())
    
    for key in all_keys:
        old_val = old_dict.get(key)
        new_val = new_dict.get(key)
        
        if old_val != new_val:
            changes[key] = {
                'old': str(old_val),
                'new': str(new_val)
            }
    
    return changes
