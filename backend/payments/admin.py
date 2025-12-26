from django.contrib import admin
from django.contrib.auth.models import User
from payments.models import (
    UserProfile, Professional, Service, Attention, Discount,
    Settlement, SettlementLineItem, SettlementDiscount
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Rol', {
            'fields': ('role', 'is_active')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Professional)
class ProfessionalAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'specialization', 'status', 'created_at']
    list_filter = ['status', 'specialization', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'license_number']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('user', 'id')
        }),
        ('Información Profesional', {
            'fields': ('license_number', 'specialization', 'default_commission_percentage')
        }),
        ('Información de Contacto', {
            'fields': ('phone', 'address')
        }),
        ('Información Bancaria', {
            'fields': ('bank_account', 'bank_name')
        }),
        ('Estado', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'base_price', 'commission_percentage', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Attention)
class AttentionAdmin(admin.ModelAdmin):
    list_display = ['professional', 'patient_name', 'service', 'date', 'amount_charged', 'status']
    list_filter = ['status', 'date', 'professional', 'service']
    search_fields = ['patient_name', 'patient_id', 'professional__user__first_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'discount_type', 'value', 'is_active', 'is_mandatory']
    list_filter = ['category', 'discount_type', 'is_active', 'is_mandatory']
    search_fields = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']


class SettlementLineItemInline(admin.TabularInline):
    model = SettlementLineItem
    readonly_fields = ['service_name', 'service_code', 'amount_charged', 'commission_amount', 'created_at']
    fields = ['service_name', 'service_code', 'attendance_date', 'amount_charged', 'commission_percentage', 'commission_amount']
    extra = 0


class SettlementDiscountInline(admin.TabularInline):
    model = SettlementDiscount
    readonly_fields = ['discount_amount', 'created_at']
    fields = ['discount', 'discount_type', 'discount_value', 'discount_amount', 'created_at']
    extra = 0


@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ['professional', 'period_start', 'period_end', 'total_commission', 'net_amount', 'status', 'payment_date']
    list_filter = ['status', 'period_end', 'professional']
    search_fields = ['professional__user__first_name', 'professional__user__last_name']
    readonly_fields = ['id', 'total_attended', 'total_commission', 'total_discounts', 'total_retentions', 'net_amount', 'created_at', 'updated_at']
    inlines = [SettlementLineItemInline, SettlementDiscountInline]
    date_hierarchy = 'period_end'
    
    fieldsets = (
        ('Información General', {
            'fields': ('id', 'professional', 'status', 'payment_reference')
        }),
        ('Período', {
            'fields': ('period_start', 'period_end')
        }),
        ('Totales Calculados', {
            'fields': ('total_attended', 'total_commission', 'total_discounts', 'total_retentions', 'net_amount'),
            'classes': ('collapse',)
        }),
        ('Pago', {
            'fields': ('payment_date', 'notes'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SettlementLineItem)
class SettlementLineItemAdmin(admin.ModelAdmin):
    list_display = ['settlement', 'service_name', 'attendance_date', 'amount_charged', 'commission_amount']
    list_filter = ['settlement__period_end', 'attendance_date']
    search_fields = ['service_name', 'settlement__professional__user__first_name']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'attendance_date'


@admin.register(SettlementDiscount)
class SettlementDiscountAdmin(admin.ModelAdmin):
    list_display = ['settlement', 'discount', 'discount_amount']
    list_filter = ['discount__category', 'settlement__period_end']
    search_fields = ['discount__name', 'settlement__professional__user__first_name']
    readonly_fields = ['id', 'created_at']
