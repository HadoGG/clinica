"""
URL configuration for clinica project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def api_root(request):
    return JsonResponse({
        'message': 'OdontAll API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/auth/login/',
            'professionals': '/api/professionals/',
            'services': '/api/services/',
            'attentions': '/api/attentions/',
            'settlements': '/api/settlements/',
            'discounts': '/api/discounts/',
            'insurance_discounts': '/api/insurance-discounts/',
            'audit_logs': '/api/audit-logs/'
        }
    })

urlpatterns = [
    path('', api_root, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
