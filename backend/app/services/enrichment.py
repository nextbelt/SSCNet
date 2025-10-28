import httpx
from typing import Dict, Optional, Any, List
import json

from app.core.config import settings


class ClearbitService:
    """
    Service for company data enrichment using Clearbit API
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'clearbit_api_key', None)
        self.base_url = "https://company.clearbit.com"
        
    async def enrich_company_by_domain(self, domain: str) -> Optional[Dict[str, Any]]:
        """
        Auto-fill company data from domain using Clearbit
        """
        if not self.api_key:
            return None
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/v2/companies/find",
                    params={"domain": domain},
                    auth=(self.api_key, "")
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "name": data.get("name"),
                        "domain": data.get("domain"),
                        "logo": data.get("logo"),
                        "description": data.get("description"),
                        "location": data.get("location"),
                        "employees": data.get("employees"),
                        "industry": data.get("industry"),
                        "tags": data.get("tags", []),
                        "founded": data.get("foundedYear"),
                        "website": data.get("site", {}).get("url")
                    }
                else:
                    print(f"Clearbit API error: {response.status_code}")
                    return None
                    
            except Exception as e:
                print(f"Error enriching company data: {e}")
                return None


class ZoomInfoService:
    """
    Service for contact data enrichment using ZoomInfo API
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'zoominfo_api_key', None)
        self.base_url = "https://api.zoominfo.com"
        
    async def get_company_contacts(self, company_domain: str) -> List[Dict[str, Any]]:
        """
        Get employee directory and decision makers from ZoomInfo
        """
        if not self.api_key:
            return []
            
        async with httpx.AsyncClient() as client:
            try:
                # Search for company first
                company_response = await client.post(
                    f"{self.base_url}/lookup/company",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={"companyDomain": company_domain}
                )
                
                if company_response.status_code != 200:
                    return []
                    
                company_data = company_response.json()
                company_id = company_data.get("data", {}).get("id")
                
                if not company_id:
                    return []
                
                # Get contacts for the company
                contacts_response = await client.post(
                    f"{self.base_url}/search/contact",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "companyId": company_id,
                        "jobLevels": ["C_LEVEL", "VP", "DIRECTOR", "MANAGER"],
                        "departmentIds": ["PURCHASING", "OPERATIONS", "SUPPLY_CHAIN"]
                    }
                )
                
                if contacts_response.status_code == 200:
                    contacts_data = contacts_response.json()
                    return [
                        {
                            "name": contact.get("firstName", "") + " " + contact.get("lastName", ""),
                            "email": contact.get("email"),
                            "title": contact.get("jobTitle"),
                            "department": contact.get("department"),
                            "phone": contact.get("directPhone"),
                            "linkedin": contact.get("linkedInUrl")
                        }
                        for contact in contacts_data.get("data", [])
                    ]
                else:
                    return []
                    
            except Exception as e:
                print(f"Error fetching ZoomInfo contacts: {e}")
                return []
    
    async def verify_poc(self, email: str, company_domain: str) -> Dict[str, Any]:
        """
        Verify if POC actually works at the company
        """
        if not self.api_key:
            return {"verified": False, "confidence": 0}
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/lookup/email",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={"emailAddress": email}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    person = data.get("data", {})
                    company = person.get("company", {})
                    
                    # Check if email domain matches company domain
                    email_domain = email.split("@")[1].lower()
                    company_domain_clean = company_domain.lower().replace("www.", "")
                    
                    domain_match = email_domain == company_domain_clean
                    company_match = company.get("companyDomain", "").lower() == company_domain_clean
                    
                    return {
                        "verified": domain_match or company_match,
                        "confidence": 95 if (domain_match and company_match) else 70 if (domain_match or company_match) else 30,
                        "current_company": company.get("companyName"),
                        "job_title": person.get("jobTitle"),
                        "last_updated": person.get("lastUpdatedDate")
                    }
                else:
                    return {"verified": False, "confidence": 0}
                    
            except Exception as e:
                print(f"Error verifying POC: {e}")
                return {"verified": False, "confidence": 0}


class DunBradstreetService:
    """
    Service for business verification using D&B API
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'dnb_api_key', None)
        self.base_url = "https://plus.dnb.com/v1"
        
    async def verify_business(
        self, 
        company_name: str, 
        address: str = None
    ) -> Dict[str, Any]:
        """
        Verify business legitimacy and get credit information
        """
        if not self.api_key:
            return {"verified": False, "confidence": 0}
            
        async with httpx.AsyncClient() as client:
            try:
                search_payload = {"companyName": company_name}
                if address:
                    search_payload["address"] = address
                    
                response = await client.post(
                    f"{self.base_url}/match/cleanseMatch",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=search_payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    match_candidates = data.get("matchCandidates", [])
                    
                    if match_candidates:
                        best_match = match_candidates[0]
                        return {
                            "verified": True,
                            "confidence": best_match.get("matchGrade", {}).get("confidenceCode", 0),
                            "duns": best_match.get("duns"),
                            "registration_status": best_match.get("registrationStatus"),
                            "years_in_business": best_match.get("yearsInBusiness"),
                            "employee_count": best_match.get("employeeCount"),
                            "annual_sales": best_match.get("annualSales"),
                            "primary_industry": best_match.get("primaryIndustryCode")
                        }
                    else:
                        return {"verified": False, "confidence": 0, "message": "No matches found"}
                else:
                    return {"verified": False, "confidence": 0, "message": "API error"}
                    
            except Exception as e:
                print(f"Error verifying business: {e}")
                return {"verified": False, "confidence": 0, "message": str(e)}


class BusinessEnrichmentService:
    """
    Unified service that combines multiple data sources for comprehensive business data
    """
    
    def __init__(self):
        self.clearbit = ClearbitService()
        self.zoominfo = ZoomInfoService()
        self.dnb = DunBradstreetService()
        
    async def enrich_company_profile(self, domain: str) -> Dict[str, Any]:
        """
        Combine data from multiple sources to create comprehensive company profile
        """
        enriched_data = {
            "domain": domain,
            "data_sources": [],
            "confidence_score": 0
        }
        
        # Try Clearbit first for basic company data
        clearbit_data = await self.clearbit.enrich_company_by_domain(domain)
        if clearbit_data:
            enriched_data.update(clearbit_data)
            enriched_data["data_sources"].append("clearbit")
            enriched_data["confidence_score"] += 30
        
        # Try D&B for business verification
        if enriched_data.get("name"):
            dnb_data = await self.dnb.verify_business(
                enriched_data["name"], 
                enriched_data.get("location")
            )
            if dnb_data.get("verified"):
                enriched_data.update({
                    "business_verified": True,
                    "duns": dnb_data.get("duns"),
                    "years_in_business": dnb_data.get("years_in_business"),
                    "employee_count_verified": dnb_data.get("employee_count")
                })
                enriched_data["data_sources"].append("dnb")
                enriched_data["confidence_score"] += 40
        
        # Get contact information from ZoomInfo
        contacts = await self.zoominfo.get_company_contacts(domain)
        if contacts:
            enriched_data["potential_contacts"] = contacts[:10]  # Limit to top 10
            enriched_data["data_sources"].append("zoominfo")
            enriched_data["confidence_score"] += 30
        
        return enriched_data
    
    async def verify_poc_employment(
        self, 
        email: str, 
        company_domain: str
    ) -> Dict[str, Any]:
        """
        Verify POC employment using multiple verification methods
        """
        verification_results = []
        
        # Method 1: Email domain matching
        email_domain = email.split("@")[1].lower()
        company_domain_clean = company_domain.lower().replace("www.", "")
        
        domain_verification = {
            "method": "email_domain",
            "verified": email_domain == company_domain_clean,
            "confidence": 90 if email_domain == company_domain_clean else 10
        }
        verification_results.append(domain_verification)
        
        # Method 2: ZoomInfo verification
        zoominfo_verification = await self.zoominfo.verify_poc(email, company_domain)
        zoominfo_verification["method"] = "zoominfo"
        verification_results.append(zoominfo_verification)
        
        # Calculate overall verification score
        total_confidence = sum(result.get("confidence", 0) for result in verification_results)
        avg_confidence = total_confidence / len(verification_results)
        
        overall_verified = any(result.get("verified", False) for result in verification_results)
        
        return {
            "verified": overall_verified,
            "confidence_score": avg_confidence,
            "verification_methods": verification_results,
            "recommendation": "approved" if avg_confidence > 70 else "manual_review" if avg_confidence > 40 else "rejected"
        }


# Global instance
business_enrichment_service = BusinessEnrichmentService()