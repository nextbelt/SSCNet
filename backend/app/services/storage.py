import boto3
from botocore.exceptions import ClientError
from typing import Dict, Optional, List, Any
import uuid
from datetime import datetime, timedelta
import mimetypes
import os

from app.core.config import settings


class S3StorageService:
    """
    Service for AWS S3 file storage and management
    Handles RFQ documents, specs, CAD files with presigned URLs
    """
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        self.bucket_name = settings.s3_bucket_name
        
    def generate_file_key(self, rfq_id: str, filename: str, file_type: str = "document") -> str:
        """
        Generate unique S3 key for uploaded files
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # Clean filename
        clean_filename = "".join(c for c in filename if c.isalnum() or c in "._-")
        
        return f"{file_type}/{rfq_id}/{timestamp}_{unique_id}_{clean_filename}"
    
    async def generate_presigned_upload_url(
        self,
        rfq_id: str,
        filename: str,
        content_type: str = None,
        file_type: str = "document",
        expiration: int = 3600
    ) -> Dict[str, str]:
        """
        Generate presigned URL for direct browser upload to S3
        Implementation matches specification example
        """
        try:
            # Auto-detect content type if not provided
            if not content_type:
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type:
                    content_type = "application/octet-stream"
            
            # Generate unique file key
            file_key = self.generate_file_key(rfq_id, filename, file_type)
            
            # Generate presigned URL for PUT operation
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key,
                    'ContentType': content_type,
                    'Metadata': {
                        'rfq_id': rfq_id,
                        'original_filename': filename,
                        'upload_timestamp': datetime.utcnow().isoformat(),
                        'file_type': file_type
                    }
                },
                ExpiresIn=expiration
            )
            
            return {
                "upload_url": presigned_url,
                "file_key": file_key,
                "content_type": content_type,
                "expires_in": expiration
            }
            
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return {"error": str(e)}
    
    async def generate_presigned_download_url(
        self,
        file_key: str,
        expiration: int = 3600,
        download_filename: str = None
    ) -> Optional[str]:
        """
        Generate presigned URL for downloading files
        """
        try:
            params = {
                'Bucket': self.bucket_name,
                'Key': file_key
            }
            
            # Set download filename if provided
            if download_filename:
                params['ResponseContentDisposition'] = f'attachment; filename="{download_filename}"'
            
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expiration
            )
            
            return presigned_url
            
        except ClientError as e:
            print(f"Error generating download URL: {e}")
            return None
    
    async def confirm_upload(
        self,
        file_key: str,
        rfq_id: str,
        original_filename: str,
        uploaded_by_user_id: str
    ) -> Dict[str, Any]:
        """
        Confirm upload completion and store metadata
        Called after successful browser upload to S3
        """
        try:
            # Verify file exists in S3
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            file_size = response['ContentLength']
            last_modified = response['LastModified']
            content_type = response.get('ContentType', 'application/octet-stream')
            
            # Extract metadata
            metadata = response.get('Metadata', {})
            
            return {
                "file_key": file_key,
                "rfq_id": rfq_id,
                "original_filename": original_filename,
                "file_size": file_size,
                "content_type": content_type,
                "uploaded_at": last_modified.isoformat(),
                "uploaded_by": uploaded_by_user_id,
                "status": "confirmed",
                "download_url": await self.generate_presigned_download_url(
                    file_key, 
                    expiration=86400,  # 24 hours
                    download_filename=original_filename
                )
            }
            
        except ClientError as e:
            print(f"Error confirming upload: {e}")
            return {"error": str(e), "status": "failed"}
    
    async def delete_file(self, file_key: str) -> bool:
        """
        Delete file from S3
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return True
            
        except ClientError as e:
            print(f"Error deleting file: {e}")
            return False
    
    async def list_rfq_files(self, rfq_id: str) -> List[Dict[str, Any]]:
        """
        List all files associated with an RFQ
        """
        try:
            prefix = f"document/{rfq_id}/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            files = []
            for obj in response.get('Contents', []):
                file_key = obj['Key']
                
                # Get object metadata
                head_response = self.s3_client.head_object(
                    Bucket=self.bucket_name,
                    Key=file_key
                )
                
                metadata = head_response.get('Metadata', {})
                
                files.append({
                    "file_key": file_key,
                    "original_filename": metadata.get('original_filename', os.path.basename(file_key)),
                    "file_size": obj['Size'],
                    "last_modified": obj['LastModified'].isoformat(),
                    "content_type": head_response.get('ContentType'),
                    "download_url": await self.generate_presigned_download_url(
                        file_key,
                        expiration=3600,
                        download_filename=metadata.get('original_filename')
                    )
                })
            
            return files
            
        except ClientError as e:
            print(f"Error listing RFQ files: {e}")
            return []
    
    async def copy_file(self, source_key: str, destination_key: str) -> bool:
        """
        Copy file within S3 bucket
        """
        try:
            copy_source = {
                'Bucket': self.bucket_name,
                'Key': source_key
            }
            
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=destination_key
            )
            
            return True
            
        except ClientError as e:
            print(f"Error copying file: {e}")
            return False
    
    async def get_file_metadata(self, file_key: str) -> Optional[Dict[str, Any]]:
        """
        Get file metadata from S3
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            return {
                "file_key": file_key,
                "file_size": response['ContentLength'],
                "content_type": response.get('ContentType'),
                "last_modified": response['LastModified'].isoformat(),
                "metadata": response.get('Metadata', {}),
                "etag": response['ETag']
            }
            
        except ClientError as e:
            print(f"Error getting file metadata: {e}")
            return None
    
    def get_file_type_from_extension(self, filename: str) -> str:
        """
        Determine file type category from extension
        """
        ext = os.path.splitext(filename)[1].lower()
        
        if ext in ['.pdf']:
            return 'specification'
        elif ext in ['.dwg', '.dxf', '.step', '.stp', '.iges', '.igs']:
            return 'cad'
        elif ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
            return 'image'
        elif ext in ['.doc', '.docx', '.txt', '.rtf']:
            return 'document'
        elif ext in ['.xls', '.xlsx', '.csv']:
            return 'spreadsheet'
        else:
            return 'document'
    
    async def validate_file_upload(
        self,
        filename: str,
        file_size: int,
        content_type: str = None
    ) -> Dict[str, Any]:
        """
        Validate file before upload
        """
        # File size limits (in bytes)
        MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
        
        # Allowed file extensions
        ALLOWED_EXTENSIONS = {
            '.pdf', '.doc', '.docx', '.txt', '.rtf',  # Documents
            '.dwg', '.dxf', '.step', '.stp', '.iges', '.igs',  # CAD files
            '.jpg', '.jpeg', '.png', '.gif', '.bmp',  # Images
            '.xls', '.xlsx', '.csv',  # Spreadsheets
            '.zip', '.rar', '.7z'  # Archives
        }
        
        ext = os.path.splitext(filename)[1].lower()
        
        errors = []
        warnings = []
        
        # Check file extension
        if ext not in ALLOWED_EXTENSIONS:
            errors.append(f"File type '{ext}' is not allowed")
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            errors.append(f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed size (100 MB)")
        
        # Check filename
        if len(filename) > 255:
            errors.append("Filename is too long (maximum 255 characters)")
        
        # Security checks
        dangerous_chars = ['<', '>', ':', '"', '|', '?', '*']
        if any(char in filename for char in dangerous_chars):
            errors.append("Filename contains invalid characters")
        
        # Warnings for large files
        if file_size > 50 * 1024 * 1024:  # 50 MB
            warnings.append("Large file size may result in slower upload")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "file_type": self.get_file_type_from_extension(filename),
            "estimated_upload_time": max(1, file_size // (1024 * 1024))  # Rough estimate in minutes
        }


# Global instance
s3_storage_service = S3StorageService()