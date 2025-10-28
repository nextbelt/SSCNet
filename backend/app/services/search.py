from elasticsearch import AsyncElasticsearch
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

from app.core.config import settings


class SearchService:
    """
    Service for Elasticsearch-powered supplier search and matching
    """
    
    def __init__(self):
        self.client = AsyncElasticsearch([settings.elasticsearch_url])
        self.suppliers_index = "suppliers"
        self.materials_index = "materials"
        self.rfqs_index = "rfqs"
    
    async def create_indices(self):
        """
        Create Elasticsearch indices with proper mappings
        """
        # Suppliers index mapping according to specification
        suppliers_mapping = {
            "mappings": {
                "properties": {
                    "company_id": {"type": "keyword"},
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {"keyword": {"type": "keyword"}}
                    },
                    "materials": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {"keyword": {"type": "keyword"}}
                    },
                    "certifications": {"type": "keyword"},
                    "location": {
                        "properties": {
                            "city": {"type": "keyword"},
                            "state": {"type": "keyword"},
                            "country": {"type": "keyword"},
                            "coordinates": {"type": "geo_point"}
                        }
                    },
                    "capabilities": {"type": "keyword"},
                    "naics_codes": {"type": "keyword"},
                    "response_rate": {"type": "integer"},
                    "avg_response_time_hours": {"type": "float"},
                    "rating": {"type": "float"},
                    "employee_count": {"type": "keyword"},
                    "founded_year": {"type": "integer"},
                    "verified": {"type": "boolean"},
                    "industry": {"type": "keyword"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"}
                }
            }
        }
        
        # Create suppliers index
        if not await self.client.indices.exists(index=self.suppliers_index):
            await self.client.indices.create(
                index=self.suppliers_index,
                body=suppliers_mapping
            )
        
        # Materials catalog mapping
        materials_mapping = {
            "mappings": {
                "properties": {
                    "name": {"type": "text", "analyzer": "standard"},
                    "category": {"type": "keyword"},
                    "subcategory": {"type": "keyword"},
                    "specifications": {"type": "text"},
                    "common_grades": {"type": "keyword"},
                    "typical_suppliers": {"type": "keyword"},
                    "certifications_required": {"type": "keyword"}
                }
            }
        }
        
        if not await self.client.indices.exists(index=self.materials_index):
            await self.client.indices.create(
                index=self.materials_index,
                body=materials_mapping
            )
    
    async def index_supplier(self, supplier_data: Dict[str, Any]) -> bool:
        """
        Index a supplier company in Elasticsearch
        """
        try:
            # Transform data to match the specification structure
            doc = {
                "company_id": supplier_data.get("id"),
                "name": supplier_data.get("name"),
                "materials": supplier_data.get("materials", []),
                "certifications": supplier_data.get("certifications", []),
                "location": {
                    "city": supplier_data.get("city"),
                    "state": supplier_data.get("state"),
                    "country": supplier_data.get("country", "USA"),
                    "coordinates": supplier_data.get("coordinates")  # [lat, lon]
                },
                "capabilities": supplier_data.get("capabilities", []),
                "naics_codes": supplier_data.get("naics_codes", []),
                "response_rate": supplier_data.get("response_rate", 0),
                "avg_response_time_hours": supplier_data.get("avg_response_time_hours"),
                "rating": supplier_data.get("rating", 0.0),
                "employee_count": supplier_data.get("employee_count"),
                "founded_year": supplier_data.get("founded_year"),
                "verified": supplier_data.get("verified", False),
                "industry": supplier_data.get("industry"),
                "created_at": supplier_data.get("created_at", datetime.utcnow()),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.client.index(
                index=self.suppliers_index,
                id=supplier_data.get("id"),
                body=doc
            )
            
            return result.get("result") in ["created", "updated"]
            
        except Exception as e:
            print(f"Error indexing supplier: {e}")
            return False
    
    async def search_suppliers(
        self,
        query: str = None,
        materials: List[str] = None,
        certifications: List[str] = None,
        location: Dict[str, Any] = None,
        min_response_rate: int = None,
        max_response_time_hours: int = None,
        min_rating: float = None,
        employee_count_range: str = None,
        verified_only: bool = False,
        page: int = 1,
        per_page: int = 20
    ) -> Dict[str, Any]:
        """
        Advanced supplier search with filters matching the specification
        """
        try:
            # Build the search query
            search_body = {
                "query": {
                    "bool": {
                        "must": [],
                        "filter": []
                    }
                },
                "sort": [],
                "from": (page - 1) * per_page,
                "size": per_page,
                "aggs": {
                    "materials": {"terms": {"field": "materials.keyword", "size": 50}},
                    "certifications": {"terms": {"field": "certifications", "size": 50}},
                    "locations": {"terms": {"field": "location.state", "size": 50}},
                    "industries": {"terms": {"field": "industry", "size": 20}}
                }
            }
            
            # Text search
            if query:
                search_body["query"]["bool"]["must"].append({
                    "multi_match": {
                        "query": query,
                        "fields": ["name^3", "materials^2", "capabilities", "industry"],
                        "type": "best_fields",
                        "fuzziness": "AUTO"
                    }
                })
            else:
                search_body["query"]["bool"]["must"].append({"match_all": {}})
            
            # Materials filter
            if materials:
                search_body["query"]["bool"]["filter"].append({
                    "terms": {"materials.keyword": materials}
                })
            
            # Certifications filter
            if certifications:
                search_body["query"]["bool"]["filter"].append({
                    "terms": {"certifications": certifications}
                })
            
            # Response rate filter
            if min_response_rate is not None:
                search_body["query"]["bool"]["filter"].append({
                    "range": {"response_rate": {"gte": min_response_rate}}
                })
            
            # Response time filter
            if max_response_time_hours is not None:
                search_body["query"]["bool"]["filter"].append({
                    "range": {"avg_response_time_hours": {"lte": max_response_time_hours}}
                })
            
            # Rating filter
            if min_rating is not None:
                search_body["query"]["bool"]["filter"].append({
                    "range": {"rating": {"gte": min_rating}}
                })
            
            # Verified filter
            if verified_only:
                search_body["query"]["bool"]["filter"].append({
                    "term": {"verified": True}
                })
            
            # Geolocation filter
            if location and location.get("coordinates") and location.get("distance"):
                search_body["query"]["bool"]["filter"].append({
                    "geo_distance": {
                        "distance": location["distance"],
                        "location.coordinates": {
                            "lat": location["coordinates"][0],
                            "lon": location["coordinates"][1]
                        }
                    }
                })
            
            # Default sorting by relevance and rating
            search_body["sort"] = [
                {"_score": {"order": "desc"}},
                {"rating": {"order": "desc"}},
                {"response_rate": {"order": "desc"}}
            ]
            
            # Execute search
            result = await self.client.search(
                index=self.suppliers_index,
                body=search_body
            )
            
            # Format response
            return {
                "total": result["hits"]["total"]["value"],
                "page": page,
                "per_page": per_page,
                "total_pages": (result["hits"]["total"]["value"] + per_page - 1) // per_page,
                "suppliers": [
                    {
                        "id": hit["_id"],
                        "score": hit["_score"],
                        **hit["_source"]
                    }
                    for hit in result["hits"]["hits"]
                ],
                "facets": {
                    "materials": [
                        {"name": bucket["key"], "count": bucket["doc_count"]}
                        for bucket in result["aggregations"]["materials"]["buckets"]
                    ],
                    "certifications": [
                        {"name": bucket["key"], "count": bucket["doc_count"]}
                        for bucket in result["aggregations"]["certifications"]["buckets"]
                    ],
                    "locations": [
                        {"name": bucket["key"], "count": bucket["doc_count"]}
                        for bucket in result["aggregations"]["locations"]["buckets"]
                    ],
                    "industries": [
                        {"name": bucket["key"], "count": bucket["doc_count"]}
                        for bucket in result["aggregations"]["industries"]["buckets"]
                    ]
                }
            }
            
        except Exception as e:
            print(f"Error searching suppliers: {e}")
            return {
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": 0,
                "suppliers": [],
                "facets": {}
            }
    
    async def get_supplier_recommendations(
        self,
        rfq_data: Dict[str, Any],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        AI-powered supplier recommendations based on RFQ requirements
        """
        try:
            # Build recommendation query based on RFQ
            must_clauses = []
            should_clauses = []
            
            # Material matching (high priority)
            if rfq_data.get("material_category"):
                must_clauses.append({
                    "match": {
                        "materials": {
                            "query": rfq_data["material_category"],
                            "boost": 3.0
                        }
                    }
                })
            
            # Certification requirements
            if rfq_data.get("required_certifications"):
                for cert in rfq_data["required_certifications"]:
                    should_clauses.append({
                        "term": {
                            "certifications": {
                                "value": cert,
                                "boost": 2.0
                            }
                        }
                    })
            
            # Geographic proximity (if location specified)
            if rfq_data.get("delivery_location_coordinates"):
                should_clauses.append({
                    "geo_distance": {
                        "distance": "500km",
                        "location.coordinates": {
                            "lat": rfq_data["delivery_location_coordinates"][0],
                            "lon": rfq_data["delivery_location_coordinates"][1]
                        },
                        "boost": 1.5
                    }
                })
            
            # Performance-based boosting
            should_clauses.extend([
                {"range": {"response_rate": {"gte": 80, "boost": 1.3}}},
                {"range": {"avg_response_time_hours": {"lte": 24, "boost": 1.2}}},
                {"range": {"rating": {"gte": 4.0, "boost": 1.4}}}
            ])
            
            search_body = {
                "query": {
                    "bool": {
                        "must": must_clauses,
                        "should": should_clauses,
                        "filter": [
                            {"term": {"verified": True}},
                            {"range": {"response_rate": {"gte": 30}}}
                        ]
                    }
                },
                "sort": [
                    {"_score": {"order": "desc"}},
                    {"rating": {"order": "desc"}},
                    {"response_rate": {"order": "desc"}}
                ],
                "size": limit
            }
            
            result = await self.client.search(
                index=self.suppliers_index,
                body=search_body
            )
            
            return [
                {
                    "supplier_id": hit["_id"],
                    "match_score": hit["_score"],
                    "name": hit["_source"]["name"],
                    "materials": hit["_source"]["materials"],
                    "certifications": hit["_source"]["certifications"],
                    "location": hit["_source"]["location"],
                    "response_rate": hit["_source"]["response_rate"],
                    "avg_response_time_hours": hit["_source"]["avg_response_time_hours"],
                    "rating": hit["_source"]["rating"],
                    "match_reasons": self._generate_match_reasons(hit["_source"], rfq_data)
                }
                for hit in result["hits"]["hits"]
            ]
            
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
    
    def _generate_match_reasons(
        self, 
        supplier: Dict[str, Any], 
        rfq_data: Dict[str, Any]
    ) -> List[str]:
        """
        Generate human-readable reasons why this supplier matches the RFQ
        """
        reasons = []
        
        # Material match
        if rfq_data.get("material_category"):
            material = rfq_data["material_category"].lower()
            if any(material in sup_material.lower() for sup_material in supplier.get("materials", [])):
                reasons.append(f"Specializes in {rfq_data['material_category']}")
        
        # Certification match
        rfq_certs = set(rfq_data.get("required_certifications", []))
        supplier_certs = set(supplier.get("certifications", []))
        if rfq_certs.intersection(supplier_certs):
            common_certs = rfq_certs.intersection(supplier_certs)
            reasons.append(f"Has required certifications: {', '.join(common_certs)}")
        
        # Performance
        if supplier.get("response_rate", 0) > 80:
            reasons.append(f"High response rate ({supplier['response_rate']}%)")
        
        if supplier.get("avg_response_time_hours", 999) < 24:
            reasons.append("Fast response time (< 24 hours)")
        
        if supplier.get("rating", 0) >= 4.0:
            reasons.append(f"Highly rated ({supplier['rating']:.1f} stars)")
        
        return reasons
    
    async def search_materials(self, query: str) -> List[Dict[str, Any]]:
        """
        Search materials catalog
        """
        try:
            search_body = {
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["name^3", "category^2", "specifications"],
                        "type": "best_fields",
                        "fuzziness": "AUTO"
                    }
                },
                "size": 50
            }
            
            result = await self.client.search(
                index=self.materials_index,
                body=search_body
            )
            
            return [
                {
                    "name": hit["_source"]["name"],
                    "category": hit["_source"]["category"],
                    "subcategory": hit["_source"]["subcategory"],
                    "specifications": hit["_source"]["specifications"],
                    "common_grades": hit["_source"]["common_grades"],
                    "score": hit["_score"]
                }
                for hit in result["hits"]["hits"]
            ]
            
        except Exception as e:
            print(f"Error searching materials: {e}")
            return []
    
    async def close(self):
        """
        Close Elasticsearch connection
        """
        await self.client.close()


# Global instance
search_service = SearchService()