"""
Custom middleware to disable caching for API responses
"""
from django.utils.deprecation import MiddlewareMixin


class NoCacheMiddleware(MiddlewareMixin):
    """
    Middleware to add cache-control headers to all responses
    preventing browser caching of API responses
    """
    
    def process_response(self, request, response):
        # Add cache-control headers to prevent caching
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, public'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        response['ETag'] = ''
        
        return response
