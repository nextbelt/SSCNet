import httpx
from typing import Optional, Dict, Any
from urllib.parse import urlencode
import json

from app.core.config import settings


class LinkedInService:
    """
    Service for LinkedIn API integration and OAuth flow
    """
    
    def __init__(self):
        self.client_id = settings.linkedin_client_id
        self.client_secret = settings.linkedin_client_secret
        self.redirect_uri = settings.linkedin_redirect_uri
        self.base_url = "https://api.linkedin.com"
        self.oauth_url = "https://www.linkedin.com/oauth/v2"
    
    def get_authorization_url(self, state: str = None) -> str:
        """
        Generate LinkedIn OAuth authorization URL
        """
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "r_liteprofile r_emailaddress r_organization_social w_member_social",
        }
        if state:
            params["state"] = state
            
        return f"{self.oauth_url}/authorization?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Exchange authorization code for access token
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.oauth_url}/accessToken",
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "redirect_uri": self.redirect_uri,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    }
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"LinkedIn token exchange failed: {response.status_code} - {response.text}")
                    return None
                    
            except Exception as e:
                print(f"Error exchanging LinkedIn code for token: {e}")
                return None
    
    async def get_user_profile(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile from LinkedIn API
        """
        async with httpx.AsyncClient() as client:
            try:
                # Get basic profile
                profile_response = await client.get(
                    f"{self.base_url}/v2/me",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if profile_response.status_code != 200:
                    print(f"LinkedIn profile fetch failed: {profile_response.status_code}")
                    return None
                
                profile_data = profile_response.json()
                
                # Get email address
                email_response = await client.get(
                    f"{self.base_url}/v2/emailAddress?q=members&projection=(elements*(handle~))",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                email_data = None
                if email_response.status_code == 200:
                    email_json = email_response.json()
                    if email_json.get("elements"):
                        email_data = email_json["elements"][0]["handle~"]["emailAddress"]
                
                # Get current position/company
                positions_response = await client.get(
                    f"{self.base_url}/v2/positions?q=members&projection=(elements*(company~(name,logoV2,industry,headquarters)))",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                current_company = None
                if positions_response.status_code == 200:
                    positions_data = positions_response.json()
                    if positions_data.get("elements"):
                        # Get the most recent position
                        recent_position = positions_data["elements"][0]
                        if recent_position.get("company~"):
                            current_company = recent_position["company~"]
                
                return {
                    "id": profile_data.get("id"),
                    "firstName": profile_data.get("firstName", {}).get("localized", {}).get("en_US", ""),
                    "lastName": profile_data.get("lastName", {}).get("localized", {}).get("en_US", ""),
                    "profilePicture": self._extract_profile_picture(profile_data),
                    "headline": profile_data.get("headline", {}).get("localized", {}).get("en_US", ""),
                    "email": email_data,
                    "currentCompany": current_company
                }
                
            except Exception as e:
                print(f"Error fetching LinkedIn user profile: {e}")
                return None
    
    async def get_company_info(self, access_token: str, company_id: str) -> Optional[Dict[str, Any]]:
        """
        Get company information from LinkedIn
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/v2/organizations/{company_id}",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"LinkedIn company fetch failed: {response.status_code}")
                    return None
                    
            except Exception as e:
                print(f"Error fetching LinkedIn company info: {e}")
                return None
    
    async def verify_company_employment(
        self, 
        access_token: str, 
        company_domain: str
    ) -> bool:
        """
        Verify if user currently works at the specified company
        This is a simplified check - in production you might want more sophisticated verification
        """
        profile = await self.get_user_profile(access_token)
        if not profile or not profile.get("currentCompany"):
            return False
        
        current_company = profile["currentCompany"]
        company_name = current_company.get("name", "").lower()
        
        # Simple domain matching - you might want to enhance this
        if company_domain.lower() in company_name or company_name in company_domain.lower():
            return True
        
        return False
    
    def _extract_profile_picture(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """
        Extract profile picture URL from LinkedIn profile data
        """
        try:
            profile_picture = profile_data.get("profilePicture", {})
            display_image = profile_picture.get("displayImage~", {})
            elements = display_image.get("elements", [])
            
            if elements:
                # Get the largest image
                largest_image = max(elements, key=lambda x: x.get("data", {}).get("com.linkedin.digitalmedia.mediaartifact.StillImage", {}).get("storageSize", {}).get("width", 0))
                identifiers = largest_image.get("identifiers", [])
                if identifiers:
                    return identifiers[0].get("identifier")
            
            return None
        except Exception:
            return None


# Global instance
linkedin_service = LinkedInService()