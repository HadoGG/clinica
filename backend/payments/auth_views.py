from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from payments.models import UserProfile

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint para login sin autenticación previa.
    Genera tokens JWT para el usuario.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.check_password(password):
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verificar que el usuario esté activo
    if not user.is_active:
        return Response(
            {'error': 'User account is disabled'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Obtener rol del usuario
    role = 'professional'
    professional_id = None
    if hasattr(user, 'profile'):
        role = user.profile.role
    
    # Obtener professional_id si es profesional
    from payments.models import Professional
    try:
        if user.is_superuser or user.is_staff:
            role = 'admin'
        else:
            professional = Professional.objects.get(user=user)
            professional_id = str(professional.id)
    except Professional.DoesNotExist:
        pass
    
    # Generar tokens JWT
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
            'professional_id': professional_id,
            'is_active': user.is_active,
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Endpoint para refrescar el token de acceso.
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root con descripción de endpoints disponibles.
    """
    return Response({
        'message': 'Bienvenido a la API de Clínica',
        'version': '1.0.0',
        'endpoints': {
            'login': '/api/auth/login/',
            'refresh': '/api/auth/refresh/',
            'professionals': '/api/professionals/',
            'services': '/api/services/',
            'attentions': '/api/attentions/',
            'discounts': '/api/discounts/',
            'settlements': '/api/settlements/',
        },
        'documentation': 'Consulta el archivo README para más información'
    })
