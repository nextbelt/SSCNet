"""
Supabase client configuration for backend
"""
import os
from supabase import create_client, Client
from functools import lru_cache

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hiawkadkxazmelnmeeto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXdrYWRreGF6bWVsbm1lZXRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMwMTI1NSwiZXhwIjoyMDgwODc3MjU1fQ.RNXm1IWVdPZ5tV7QzxISwJhnuRADaQL9Hpovjovoe2M")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")


@lru_cache()
def get_supabase_client() -> Client:
    """Get cached Supabase client instance"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase() -> Client:
    """Dependency for FastAPI routes"""
    return get_supabase_client()
