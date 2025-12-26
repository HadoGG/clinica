from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'
    verbose_name = 'Gestión de Pagos'
    
    def ready(self):
        """Importar signals cuando la app esté lista"""
        import payments.signals
