import httpx
from typing import Dict, List, Optional, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, PlainTextContent, HtmlContent
import json

from app.core.config import settings


class EmailService:
    """
    Service for email operations using SendGrid API
    Handles RFQ notifications, verification emails, and communications
    """
    
    def __init__(self):
        self.client = SendGridAPIClient(api_key=settings.sendgrid_api_key)
        self.from_email = settings.from_email
        
    async def send_rfq_notification(
        self,
        to_email: str,
        supplier_name: str,
        buyer_company: str,
        material: str,
        quantity: str,
        rfq_link: str,
        template_id: str = "rfq_notification"
    ) -> bool:
        """
        Send RFQ notification to supplier POC
        """
        try:
            message = Mail(
                from_email=From(self.from_email, "SSCN Platform"),
                to_emails=To(to_email),
                subject=Subject(f"New RFQ Match: {material}"),
                html_content=HtmlContent(f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New RFQ Opportunity</h2>
                    <p>Hello {supplier_name},</p>
                    <p>A new RFQ has been posted that matches your capabilities:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>RFQ Details</h3>
                        <p><strong>Buyer:</strong> {buyer_company}</p>
                        <p><strong>Material:</strong> {material}</p>
                        <p><strong>Quantity:</strong> {quantity}</p>
                    </div>
                    
                    <p>
                        <a href="{rfq_link}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            View RFQ & Respond
                        </a>
                    </p>
                    
                    <p>Best regards,<br>SSCN Team</p>
                </div>
                """)
            )
            
            response = self.client.send(message)
            return response.status_code in [200, 202]
            
        except Exception as e:
            print(f"Error sending RFQ notification: {e}")
            return False
    
    async def send_response_notification(
        self,
        to_email: str,
        buyer_name: str,
        supplier_company: str,
        rfq_title: str,
        rfq_link: str
    ) -> bool:
        """
        Send notification when supplier responds to RFQ
        """
        try:
            message = Mail(
                from_email=From(self.from_email, "SSCN Platform"),
                to_emails=To(to_email),
                subject=Subject(f"New Response: {rfq_title}"),
                html_content=HtmlContent(f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New RFQ Response</h2>
                    <p>Hello {buyer_name},</p>
                    <p>You have received a new response to your RFQ:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>{rfq_title}</h3>
                        <p><strong>Response from:</strong> {supplier_company}</p>
                    </div>
                    
                    <p>
                        <a href="{rfq_link}" 
                           style="background-color: #28a745; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            View Response
                        </a>
                    </p>
                    
                    <p>Best regards,<br>SSCN Team</p>
                </div>
                """)
            )
            
            response = self.client.send(message)
            return response.status_code in [200, 202]
            
        except Exception as e:
            print(f"Error sending response notification: {e}")
            return False
    
    async def send_verification_email(
        self,
        to_email: str,
        user_name: str,
        verification_link: str
    ) -> bool:
        """
        Send email verification to new users
        """
        try:
            message = Mail(
                from_email=From(self.from_email, "SSCN Platform"),
                to_emails=To(to_email),
                subject=Subject("Verify Your SSCN Account"),
                html_content=HtmlContent(f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to SSCN!</h2>
                    <p>Hello {user_name},</p>
                    <p>Please verify your email address to complete your registration:</p>
                    
                    <p>
                        <a href="{verification_link}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </p>
                    
                    <p>If you didn't create this account, please ignore this email.</p>
                    
                    <p>Best regards,<br>SSCN Team</p>
                </div>
                """)
            )
            
            response = self.client.send(message)
            return response.status_code in [200, 202]
            
        except Exception as e:
            print(f"Error sending verification email: {e}")
            return False
    
    async def send_poc_availability_alert(
        self,
        to_email: str,
        poc_name: str,
        company_name: str
    ) -> bool:
        """
        Send alert when POC availability status changes
        """
        try:
            message = Mail(
                from_email=From(self.from_email, "SSCN Platform"),
                to_emails=To(to_email),
                subject=Subject("POC Status Update"),
                html_content=HtmlContent(f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>POC Availability Update</h2>
                    <p>POC {poc_name} from {company_name} has updated their availability status.</p>
                    
                    <p>Check the platform for current availability and response times.</p>
                    
                    <p>Best regards,<br>SSCN Team</p>
                </div>
                """)
            )
            
            response = self.client.send(message)
            return response.status_code in [200, 202]
            
        except Exception as e:
            print(f"Error sending POC alert: {e}")
            return False
    
    async def send_weekly_digest(
        self,
        to_email: str,
        user_name: str,
        digest_data: Dict[str, Any]
    ) -> bool:
        """
        Send weekly digest with platform activity
        """
        try:
            new_rfqs = digest_data.get("new_rfqs", 0)
            responses_received = digest_data.get("responses_received", 0)
            active_conversations = digest_data.get("active_conversations", 0)
            
            message = Mail(
                from_email=From(self.from_email, "SSCN Platform"),
                to_emails=To(to_email),
                subject=Subject("Your Weekly SSCN Digest"),
                html_content=HtmlContent(f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Weekly Activity Summary</h2>
                    <p>Hello {user_name},</p>
                    <p>Here's your activity summary for this week:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>This Week's Activity</h3>
                        <p><strong>New RFQs:</strong> {new_rfqs}</p>
                        <p><strong>Responses Received:</strong> {responses_received}</p>
                        <p><strong>Active Conversations:</strong> {active_conversations}</p>
                    </div>
                    
                    <p>Stay active to maximize your sourcing opportunities!</p>
                    
                    <p>Best regards,<br>SSCN Team</p>
                </div>
                """)
            )
            
            response = self.client.send(message)
            return response.status_code in [200, 202]
            
        except Exception as e:
            print(f"Error sending weekly digest: {e}")
            return False


class EmailVerificationService:
    """
    Service for email verification using Hunter.io or similar
    """
    
    def __init__(self):
        self.hunter_api_key = getattr(settings, 'hunter_api_key', None)
        
    async def verify_email(self, email: str) -> Dict[str, Any]:
        """
        Verify if email address is valid and deliverable
        """
        if not self.hunter_api_key:
            return {"status": "unknown", "score": 0, "message": "Hunter API key not configured"}
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://api.hunter.io/v2/email-verifier",
                    params={
                        "email": email,
                        "api_key": self.hunter_api_key
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "status": data.get("data", {}).get("status", "unknown"),
                        "score": data.get("data", {}).get("score", 0),
                        "regexp": data.get("data", {}).get("regexp", False),
                        "smtp_check": data.get("data", {}).get("smtp_check", False),
                        "message": "Verification complete"
                    }
                else:
                    return {"status": "error", "score": 0, "message": "Verification failed"}
                    
            except Exception as e:
                print(f"Error verifying email: {e}")
                return {"status": "error", "score": 0, "message": str(e)}


# Global instances
email_service = EmailService()
email_verification_service = EmailVerificationService()