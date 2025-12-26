from django.urls import path, include
from rest_framework.routers import DefaultRouter
from payments.views import (
    UserViewSet, ProfessionalViewSet, ServiceViewSet, AttentionViewSet,
    DiscountViewSet, InsuranceDiscountViewSet, SettlementViewSet, AuditLogViewSet
)
from payments.auth_views import login_view, refresh_token_view, api_root

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'professionals', ProfessionalViewSet, basename='professional')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'attentions', AttentionViewSet, basename='attention')
router.register(r'discounts', DiscountViewSet, basename='discount')
router.register(r'insurance-discounts', InsuranceDiscountViewSet, basename='insurance-discount')
router.register(r'settlements', SettlementViewSet, basename='settlement')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('', api_root, name='api-root'),
    path('auth/login/', login_view, name='login'),
    path('auth/refresh/', refresh_token_view, name='refresh-token'),
    path('', include(router.urls)),
]
