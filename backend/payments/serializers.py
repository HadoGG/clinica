from rest_framework import serializers
from django.contrib.auth.models import User
from payments.models import (
    Professional, Service, Attention, Discount, InsuranceDiscount,
    Settlement, SettlementLineItem, SettlementDiscount, UserProfile, AuditLog
)


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_active_profile = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    specialization = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'role', 'is_active_profile', 'date_joined', 'password', 'specialization', 'phone']
        read_only_fields = ['id', 'date_joined']
    
    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'professional'
    
    def get_is_active_profile(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.is_active
        return obj.is_active
    
    def create(self, validated_data):
        """
        Crea usuario, asigna contraseña y crea perfil + Professional.
        
        Process:
        1. Extrae contraseña, especialización y teléfono (específicos del serializer)
        2. Crea usuario sin contraseña (siguiendo buenas prácticas)
        3. Asigna contraseña hasheada con algoritmo configurado (PBKDF2 por defecto)
        4. Crea UserProfile con rol 'professional' por defecto
        5. Crea Professional asociado (solo si el rol es 'professional')
        
        Seguridad:
        - Contraseña se hashea con set_password() usando PBKDF2 + Argon2 (fallback)
        - Nunca se almacena contraseña en texto plano
        - No se expone contraseña en respuestas
        
        Args:
            validated_data (dict): Datos validados por el serializer
            
        Returns:
            User: Usuario creado con profile y professional asociados
        """
        password = validated_data.pop('password', None)
        specialization = validated_data.pop('specialization', '')
        phone = validated_data.pop('phone', '')
        
        # Crear usuario sin la contraseña primero
        user = User.objects.create(**validated_data)
        
        # Establecer la contraseña de forma segura
        if password:
            user.set_password(password)
            user.save()
        
        # Crear perfil si no existe (por defecto es 'professional')
        if not hasattr(user, 'profile'):
            profile = UserProfile.objects.create(user=user, role='professional')
        else:
            profile = user.profile
        
        # Crear Professional SOLO si el rol es 'professional'
        if profile.role == 'professional' and not Professional.objects.filter(user=user).exists():
            Professional.objects.create(
                user=user,
                status='active',
                specialization=specialization or '',
                phone=phone or ''
            )
        
        return user
    
    def update(self, instance, validated_data):
        """Actualiza usuario, incluyendo contraseña si se proporciona"""
        password = validated_data.pop('password', None)
        specialization = validated_data.pop('specialization', None)
        phone = validated_data.pop('phone', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        
        # Actualizar Professional si existe
        if hasattr(instance, 'professional_profile'):
            prof = instance.professional_profile
            if specialization is not None:
                prof.specialization = specialization
            if phone is not None:
                prof.phone = phone
            prof.save()
        
        return instance


class ProfessionalSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    
    class Meta:
        model = Professional
        fields = [
            'id', 'user', 'user_email', 'user_full_name', 'license_number',
            'specialization', 'phone', 'address', 'status',
            'default_commission_percentage', 'bank_account', 'bank_name',
            'first_name', 'last_name', 'email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Crea un usuario automáticamente si no existe"""
        # Extraer datos de usuario
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        email = validated_data.pop('email', '')
        license_number = validated_data.get('license_number', '')
        
        # Crear usuario si no existe
        if not validated_data.get('user'):
            # Generar username único basado en licencia o email
            username = email.split('@')[0] if email else f'prof_{license_number}'
            
            # Verificar si ya existe
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': True
                }
            )
            validated_data['user'] = user
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Actualiza el usuario asociado si se proporcionan datos"""
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        
        # Actualizar usuario si se proporcionaron datos
        if first_name or last_name or email:
            user = instance.user
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            if email:
                user.email = email
            user.save()
        
        return super().update(instance, validated_data)


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'base_price', 'commission_percentage',
            'code', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttentionSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(source='professional.user.get_full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    calculated_commission = serializers.SerializerMethodField()
    
    class Meta:
        model = Attention
        fields = [
            'id', 'professional', 'professional_name', 'service', 'service_name',
            'patient_name', 'patient_id', 'health_insurance', 'date', 'amount_charged',
            'insurance_discount_percentage', 'commission_percentage', 'calculated_commission', 
            'notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_calculated_commission(self, obj):
        return float(obj.calculate_commission())


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = [
            'id', 'name', 'description', 'discount_type', 'category',
            'value', 'is_active', 'is_mandatory', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SettlementLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettlementLineItem
        fields = [
            'id', 'settlement', 'attention', 'service_name', 'service_code',
            'attendance_date', 'amount_charged', 'commission_percentage',
            'commission_amount', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SettlementDiscountSerializer(serializers.ModelSerializer):
    discount_name = serializers.CharField(source='discount.name', read_only=True)
    
    class Meta:
        model = SettlementDiscount
        fields = [
            'id', 'settlement', 'discount', 'discount_name', 'discount_type',
            'discount_value', 'discount_amount', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SettlementDetailSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(source='professional.user.get_full_name', read_only=True)
    line_items = SettlementLineItemSerializer(many=True, read_only=True)
    discounts_applied = SettlementDiscountSerializer(many=True, read_only=True)
    
    class Meta:
        model = Settlement
        fields = [
            'id', 'professional', 'professional_name', 'period_start', 'period_end',
            'total_attended', 'total_commission', 'total_discounts', 'total_retentions',
            'net_amount', 'status', 'payment_reference', 'payment_date', 'notes',
            'line_items', 'discounts_applied', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SettlementListSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(source='professional.user.get_full_name', read_only=True)
    
    class Meta:
        model = Settlement
        fields = [
            'id', 'professional', 'professional_name', 'period_start', 'period_end',
            'total_commission', 'net_amount', 'status', 'payment_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SettlementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settlement
        fields = [
            'id', 'professional', 'period_start', 'period_end', 'status', 'notes'
        ]
        read_only_fields = ['id']


class InsuranceDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceDiscount
        fields = [
            'id', 'insurance_name', 'discount_type', 'discount_value',
            'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    model_display = serializers.CharField(source='get_model_name_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_display', 'action', 'action_display',
            'model_name', 'model_display', 'object_id', 'object_description',
            'changes', 'old_values', 'new_values', 'ip_address', 'user_agent',
            'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_display', 'action', 'action_display',
            'model_name', 'model_display', 'changes', 'old_values', 'new_values',
            'ip_address', 'user_agent', 'created_at'
        ]
