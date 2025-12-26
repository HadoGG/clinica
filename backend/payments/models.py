from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


class UserProfile(models.Model):
    """Perfil extendido del usuario con roles"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('professional', 'Profesional'),
        ('staff', 'Personal'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='professional')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"


class Professional(models.Model):
    """Modelo para gestionar profesionales (dentistas) en la clínica"""
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('suspended', 'Suspendido'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professional_profile')
    license_number = models.CharField(max_length=50, blank=True, null=True, unique=True, verbose_name='Número de Licencia')
    specialization = models.CharField(max_length=100, blank=True, verbose_name='Especialización')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Comisión o porcentaje por defecto
    default_commission_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=30.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Porcentaje de Comisión por Defecto (%)'
    )
    
    bank_account = models.CharField(max_length=50, blank=True, verbose_name='Cuenta Bancaria')
    bank_name = models.CharField(max_length=100, blank=True, verbose_name='Nombre del Banco')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Profesional'
        verbose_name_plural = 'Profesionales'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.license_number}"


class Service(models.Model):
    """Modelo para gestionar los servicios/prestaciones"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True, verbose_name='Nombre del Servicio')
    description = models.TextField(blank=True, verbose_name='Descripción')
    
    # Precio del servicio
    base_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Precio Base'
    )
    
    # Porcentaje de la comisión para este servicio
    commission_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=30.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Porcentaje de Comisión (%)'
    )
    
    code = models.CharField(max_length=50, unique=True, verbose_name='Código del Servicio')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Attention(models.Model):
    """Modelo para registrar atenciones/procedimientos realizados"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.ForeignKey(Professional, on_delete=models.CASCADE, related_name='attentions')
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name='attentions')
    
    # Información del paciente (básica)
    patient_name = models.CharField(max_length=200, verbose_name='Nombre del Paciente')
    patient_id = models.CharField(max_length=50, blank=True, verbose_name='Cédula del Paciente')
    
    # Aseguradora
    health_insurance = models.CharField(max_length=100, blank=True, verbose_name='Aseguradora de Salud')
    
    # Detalles de la atención
    date = models.DateTimeField(verbose_name='Fecha de Atención')
    amount_charged = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Monto Cobrado'
    )
    
    # Descuento por aseguradora
    insurance_discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Descuento por Aseguradora (%)'
    )
    
    # Comisión específica para esta atención
    commission_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Porcentaje de Comisión (%)',
        null=True, blank=True
    )
    
    notes = models.TextField(blank=True, verbose_name='Notas')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Atención'
        verbose_name_plural = 'Atenciones'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['professional', '-date']),
            models.Index(fields=['status', '-date']),
        ]
    
    def __str__(self):
        return f"{self.professional} - {self.patient_name} - {self.date.strftime('%d/%m/%Y')}"
    
    def calculate_commission(self):
        """
        Calcula la comisión para esta atención.
        
        Lógica:
        1. Usa comisión específica de la atención si existe, sino usa la del servicio
        2. Aplica descuento por aseguradora al monto base si es > 0
        3. Calcula la comisión sobre el monto neto (monto_base - descuento_aseguradora)
        
        Returns:
            float: Monto de la comisión calculada
            
        Ejemplo:
            Atención con $100 cobrado, 20% descuento aseguradora, 30% comisión:
            - Monto neto: $100 - ($100 * 20%) = $80
            - Comisión: $80 * 30% = $24
        """
        # Determinar porcentaje de comisión (específico o por defecto del servicio)
        commission_pct = self.commission_percentage
        if commission_pct is None:
            commission_pct = self.service.commission_percentage
        
        # Aplicar descuento por aseguradora si existe
        amount_base = self.amount_charged
        if self.insurance_discount_percentage > 0:
            discount = (amount_base * self.insurance_discount_percentage) / 100
            amount_base = amount_base - discount
        
        return (amount_base * commission_pct) / 100


class Discount(models.Model):
    """Modelo para gestionar descuentos y retenciones"""
    
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Porcentaje'),
        ('fixed', 'Monto Fijo'),
    ]
    
    CATEGORY_CHOICES = [
        ('discount', 'Descuento'),
        ('retention', 'Retención'),
        ('deduction', 'Deducción'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='Nombre del Descuento/Retención')
    description = models.TextField(blank=True)
    
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Valor del descuento
    value = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Valor'
    )
    
    is_active = models.BooleanField(default=True)
    is_mandatory = models.BooleanField(default=False, verbose_name='¿Es Obligatorio?')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Descuento/Retención'
        verbose_name_plural = 'Descuentos/Retenciones'
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class InsuranceDiscount(models.Model):
    """Modelo para gestionar descuentos específicos por aseguradora"""
    
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Porcentaje'),
        ('fixed', 'Monto Fijo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    insurance_name = models.CharField(max_length=200, unique=True, verbose_name='Nombre de la Aseguradora')
    
    # Descuento aplicado
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Valor del Descuento'
    )
    
    description = models.TextField(blank=True, verbose_name='Descripción')
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Descuento por Aseguradora'
        verbose_name_plural = 'Descuentos por Aseguradora'
        ordering = ['insurance_name']
    
    def __str__(self):
        return f"{self.insurance_name} - {self.discount_value}% descuento"


class Settlement(models.Model):
    """Modelo para gestionar liquidaciones de pago"""
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('calculated', 'Calculada'),
        ('approved', 'Aprobada'),
        ('paid', 'Pagada'),
        ('cancelled', 'Cancelada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.ForeignKey(Professional, on_delete=models.CASCADE, related_name='settlements')
    
    period_start = models.DateField(verbose_name='Fecha Inicio Período')
    period_end = models.DateField(verbose_name='Fecha Fin Período')
    
    # Totales
    total_attended = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name='Total Atenciones'
    )
    total_commission = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name='Total Comisión'
    )
    total_discounts = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name='Total Descuentos'
    )
    total_retentions = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name='Total Retenciones'
    )
    net_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name='Monto Neto a Pagar'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Referencia de pago
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Pago')
    
    notes = models.TextField(blank=True, verbose_name='Notas')
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='settlements_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Liquidación'
        verbose_name_plural = 'Liquidaciones'
        ordering = ['-period_end']
        unique_together = ['professional', 'period_start', 'period_end']
    
    def __str__(self):
        return f"Liquidación {self.professional} ({self.period_start} - {self.period_end})"


class SettlementLineItem(models.Model):
    """Modelo para detallar los ítems de cada liquidación"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    settlement = models.ForeignKey(Settlement, on_delete=models.CASCADE, related_name='line_items')
    attention = models.ForeignKey(Attention, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Detalles del servicio
    service_name = models.CharField(max_length=200)
    service_code = models.CharField(max_length=50, blank=True)
    
    attendance_date = models.DateField()
    amount_charged = models.DecimalField(max_digits=10, decimal_places=2)
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Detalle de Liquidación'
        verbose_name_plural = 'Detalles de Liquidación'
    
    def __str__(self):
        return f"{self.service_name} - ${self.commission_amount}"


class SettlementDiscount(models.Model):
    """Modelo para detallar descuentos/retenciones aplicadas en liquidaciones"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    settlement = models.ForeignKey(Settlement, on_delete=models.CASCADE, related_name='discounts_applied')
    discount = models.ForeignKey(Discount, on_delete=models.PROTECT)
    
    discount_type = models.CharField(max_length=20)  # 'percentage' o 'fixed'
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Descuento en Liquidación'
        verbose_name_plural = 'Descuentos en Liquidación'
    
    def __str__(self):
        return f"{self.discount.name} - ${self.discount_amount}"


class AuditLog(models.Model):
    """Modelo para registrar auditoría de todos los cambios del sistema"""
    
    ACTION_CHOICES = [
        ('create', 'Creado'),
        ('update', 'Actualizado'),
        ('delete', 'Eliminado'),
        ('status_change', 'Cambio de Estado'),
        ('payment', 'Pago Registrado'),
        ('settlement_generated', 'Liquidación Generada'),
    ]
    
    MODEL_CHOICES = [
        ('User', 'Usuario'),
        ('Professional', 'Profesional'),
        ('Service', 'Servicio'),
        ('Attention', 'Atención'),
        ('Settlement', 'Liquidación'),
        ('Discount', 'Descuento'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=50, choices=MODEL_CHOICES)
    object_id = models.CharField(max_length=200, verbose_name='ID del Objeto')
    object_description = models.CharField(max_length=500, blank=True, verbose_name='Descripción del Objeto')
    
    # Cambios realizados
    changes = models.JSONField(null=True, blank=True, verbose_name='Cambios (JSON)')
    old_values = models.JSONField(null=True, blank=True, verbose_name='Valores Anteriores')
    new_values = models.JSONField(null=True, blank=True, verbose_name='Valores Nuevos')
    
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='Dirección IP')
    user_agent = models.TextField(blank=True, verbose_name='User Agent')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Registro de Auditoría'
        verbose_name_plural = 'Registros de Auditoría'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['model_name', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.get_model_name_display()} ({self.created_at.strftime('%d/%m/%Y %H:%M')})"
