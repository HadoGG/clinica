from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permite acceso solo a administradores"""
    def has_permission(self, request, view):
        # Superusers (Django admin) tienen acceso completo
        if request.user and request.user.is_superuser:
            return True
        # También permite usuarios con role 'admin' en el perfil
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'


class IsProfessional(permissions.BasePermission):
    """Permite acceso solo a profesionales"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'professional'


class IsAdminOrReadOnly(permissions.BasePermission):
    """Administradores pueden hacer cualquier cosa, otros solo lectura"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'


class IsAdminOrOwnProfessional(permissions.BasePermission):
    """Administradores pueden ver todo, profesionales solo sus propios datos"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin puede ver todo
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            return True
        
        # Si es profesional, solo puede acceder a sus propios datos
        if hasattr(request.user, 'profile') and request.user.profile.role == 'professional':
            # Para Professional
            if hasattr(obj, 'user'):
                return obj.user == request.user
            # Para Attention, Service, etc - verificar si pertenecen a su profesional
            if hasattr(obj, 'professional'):
                return obj.professional.user == request.user
            if hasattr(obj, 'professional_id'):
                return obj.professional_id == request.user.professional_profile.id
        
        return False


class IsAdminOrOwnAttention(permissions.BasePermission):
    """Para atenciones: admin ve todo, profesional solo sus atenciones"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin puede ver todo
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            return True
        
        # Profesional solo puede ver sus propias atenciones
        if hasattr(request.user, 'profile') and request.user.profile.role == 'professional':
            return obj.professional.user == request.user
        
        return False
