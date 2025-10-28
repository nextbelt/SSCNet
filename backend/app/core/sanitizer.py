"""
Input Sanitization for XSS Prevention
SOC 2 Requirement: Processing Integrity - Input Validation
"""
import bleach
from typing import Optional, Dict, Any, List


# Allowed HTML tags for rich text fields (very restrictive)
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'span'
]

# Allowed HTML attributes
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'rel'],
    'span': ['class'],
    'code': ['class']
}

# Allowed URL protocols
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']


def sanitize_html(text: Optional[str], strip: bool = False) -> Optional[str]:
    """
    Sanitize HTML content to prevent XSS attacks.
    
    Args:
        text: HTML string to sanitize
        strip: If True, strip all HTML tags. If False, allow safe tags.
    
    Returns:
        Sanitized string safe for display
    """
    if text is None:
        return None
    
    if strip:
        # Strip all HTML tags - for fields that should be plain text
        return bleach.clean(text, tags=[], strip=True)
    else:
        # Allow safe HTML tags - for rich text fields
        return bleach.clean(
            text,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            protocols=ALLOWED_PROTOCOLS,
            strip=True  # Strip tags that aren't allowed
        )


def sanitize_plain_text(text: Optional[str]) -> Optional[str]:
    """
    Sanitize plain text by stripping all HTML tags.
    Use for fields like names, titles, categories, etc.
    
    Args:
        text: String to sanitize
    
    Returns:
        Sanitized string with all HTML removed
    """
    if text is None:
        return None
    
    # Strip all HTML tags and trim whitespace
    sanitized = bleach.clean(text, tags=[], strip=True)
    return sanitized.strip()


def sanitize_url(url: Optional[str]) -> Optional[str]:
    """
    Sanitize and validate URLs.
    
    Args:
        url: URL string to sanitize
    
    Returns:
        Sanitized URL or None if invalid
    """
    if url is None or url.strip() == "":
        return None
    
    # Remove HTML tags
    url = bleach.clean(url, tags=[], strip=True).strip()
    
    # Check if URL starts with allowed protocol
    if not any(url.startswith(f"{protocol}://") for protocol in ALLOWED_PROTOCOLS):
        # If no protocol, assume https
        if not url.startswith("//"):
            url = f"https://{url}"
    
    # Basic URL validation
    if len(url) > 2048:  # URLs longer than 2048 chars are suspicious
        return None
    
    # Prevent javascript: and data: URLs
    if url.lower().startswith(("javascript:", "data:", "vbscript:")):
        return None
    
    return url


def sanitize_filename(filename: Optional[str]) -> Optional[str]:
    """
    Sanitize filename to prevent directory traversal and other attacks.
    
    Args:
        filename: Filename to sanitize
    
    Returns:
        Sanitized filename
    """
    if filename is None:
        return None
    
    # Remove HTML tags
    filename = bleach.clean(filename, tags=[], strip=True)
    
    # Remove directory traversal attempts
    filename = filename.replace("..", "").replace("/", "").replace("\\", "")
    
    # Remove null bytes
    filename = filename.replace("\0", "")
    
    # Limit length
    if len(filename) > 255:
        filename = filename[:255]
    
    return filename.strip()


def sanitize_dict(data: Dict[str, Any], text_fields: List[str], html_fields: List[str] = None) -> Dict[str, Any]:
    """
    Sanitize multiple fields in a dictionary.
    
    Args:
        data: Dictionary containing fields to sanitize
        text_fields: List of field names that should be plain text
        html_fields: List of field names that can contain safe HTML
    
    Returns:
        Dictionary with sanitized fields
    """
    if html_fields is None:
        html_fields = []
    
    sanitized = data.copy()
    
    # Sanitize plain text fields
    for field in text_fields:
        if field in sanitized and isinstance(sanitized[field], str):
            sanitized[field] = sanitize_plain_text(sanitized[field])
    
    # Sanitize HTML fields
    for field in html_fields:
        if field in sanitized and isinstance(sanitized[field], str):
            sanitized[field] = sanitize_html(sanitized[field], strip=False)
    
    return sanitized


def validate_file_upload(
    filename: str,
    content_type: str,
    file_size: int,
    max_size_mb: int = 10,
    allowed_types: List[str] = None
) -> tuple[bool, Optional[str]]:
    """
    Validate file upload for security.
    
    Args:
        filename: Name of uploaded file
        content_type: MIME type of file
        file_size: Size in bytes
        max_size_mb: Maximum allowed size in MB
        allowed_types: List of allowed MIME types
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if allowed_types is None:
        # Default allowed types for business documents
        allowed_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'text/csv'
        ]
    
    # Check file size
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        return False, f"File size exceeds {max_size_mb}MB limit"
    
    # Check content type
    if content_type not in allowed_types:
        return False, f"File type '{content_type}' is not allowed"
    
    # Check filename
    sanitized_filename = sanitize_filename(filename)
    if not sanitized_filename or sanitized_filename == "":
        return False, "Invalid filename"
    
    # Check for double extensions (e.g., file.pdf.exe)
    if filename.count('.') > 1:
        # Allow only one extension
        parts = filename.split('.')
        if len(parts) > 2:
            return False, "Multiple file extensions not allowed"
    
    # Block dangerous extensions even if MIME type is OK
    dangerous_extensions = [
        '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
        '.app', '.deb', '.rpm', '.dmg', '.pkg', '.run'
    ]
    
    filename_lower = filename.lower()
    if any(filename_lower.endswith(ext) for ext in dangerous_extensions):
        return False, "Executable files are not allowed"
    
    return True, None


# Example usage for RFQ specifications field
def sanitize_rfq_data(rfq_data: dict) -> dict:
    """
    Sanitize RFQ data before storing in database.
    
    Args:
        rfq_data: Dictionary containing RFQ fields
    
    Returns:
        Sanitized dictionary
    """
    # Fields that should be plain text (no HTML)
    plain_text_fields = [
        'title',
        'material_category',
        'delivery_location',
        'preferred_suppliers'
    ]
    
    # Fields that can contain safe HTML (rich text)
    html_fields = [
        'specifications',
        'required_certifications'
    ]
    
    return sanitize_dict(rfq_data, plain_text_fields, html_fields)


# Example usage for company data
def sanitize_company_data(company_data: dict) -> dict:
    """
    Sanitize company data before storing in database.
    
    Args:
        company_data: Dictionary containing company fields
    
    Returns:
        Sanitized dictionary
    """
    plain_text_fields = [
        'name',
        'industry',
        'headquarters',
        'tax_id'
    ]
    
    html_fields = [
        'description',
        'capabilities',
        'certifications'
    ]
    
    sanitized = sanitize_dict(company_data, plain_text_fields, html_fields)
    
    # Sanitize website URL
    if 'website' in sanitized:
        sanitized['website'] = sanitize_url(sanitized['website'])
    
    return sanitized


# Example usage for user profile
def sanitize_user_data(user_data: dict) -> dict:
    """
    Sanitize user profile data before storing in database.
    
    Args:
        user_data: Dictionary containing user fields
    
    Returns:
        Sanitized dictionary
    """
    plain_text_fields = [
        'name',
        'email',
        'phone',
        'title',
        'department'
    ]
    
    html_fields = [
        'bio'
    ]
    
    return sanitize_dict(user_data, plain_text_fields, html_fields)
