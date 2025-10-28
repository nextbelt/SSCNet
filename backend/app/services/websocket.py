import pusher
from typing import Dict, Any, List, Optional
import json
from datetime import datetime

from app.core.config import settings


class PusherService:
    """
    Service for real-time messaging and notifications using Pusher WebSockets
    Handles RFQ responses, chat, status updates
    """
    
    def __init__(self):
        self.client = pusher.Pusher(
            app_id=settings.pusher_app_id,
            key=settings.pusher_key,
            secret=settings.pusher_secret,
            cluster=settings.pusher_cluster,
            ssl=True
        )
    
    async def notify_new_rfq_response(
        self,
        rfq_id: str,
        supplier_name: str,
        response_id: str,
        buyer_user_id: str = None
    ) -> bool:
        """
        Send real-time notification when supplier responds to RFQ
        Matches specification example exactly
        """
        try:
            channel = f"rfq-{rfq_id}"
            event = "new-response"
            data = {
                "supplier_name": supplier_name,
                "response_id": response_id,
                "timestamp": datetime.utcnow().isoformat(),
                "message": f"New quote from {supplier_name}"
            }
            
            # Send to RFQ-specific channel
            result = self.client.trigger(channel, event, data)
            
            # Also send to buyer's personal channel if specified
            if buyer_user_id:
                personal_channel = f"user-{buyer_user_id}"
                personal_data = {
                    **data,
                    "rfq_id": rfq_id,
                    "type": "rfq_response"
                }
                self.client.trigger(personal_channel, "notification", personal_data)
            
            return result.get("status_code") == 200
            
        except Exception as e:
            print(f"Error sending RFQ response notification: {e}")
            return False
    
    async def notify_new_message(
        self,
        rfq_id: str,
        sender_name: str,
        message_content: str,
        recipient_user_id: str,
        message_id: str
    ) -> bool:
        """
        Send real-time notification for new chat messages
        """
        try:
            # Send to RFQ conversation channel
            conversation_channel = f"rfq-{rfq_id}-chat"
            conversation_data = {
                "message_id": message_id,
                "sender_name": sender_name,
                "content": message_content,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            result1 = self.client.trigger(conversation_channel, "new-message", conversation_data)
            
            # Send to recipient's personal channel
            personal_channel = f"user-{recipient_user_id}"
            notification_data = {
                "type": "new_message",
                "rfq_id": rfq_id,
                "sender_name": sender_name,
                "preview": message_content[:100] + ("..." if len(message_content) > 100 else ""),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            result2 = self.client.trigger(personal_channel, "notification", notification_data)
            
            return (result1.get("status_code") == 200 and 
                    result2.get("status_code") == 200)
            
        except Exception as e:
            print(f"Error sending message notification: {e}")
            return False
    
    async def notify_poc_status_change(
        self,
        company_id: str,
        poc_name: str,
        new_status: str,
        company_members: List[str] = None
    ) -> bool:
        """
        Notify when POC availability status changes
        """
        try:
            channel = f"company-{company_id}"
            data = {
                "poc_name": poc_name,
                "new_status": new_status,
                "timestamp": datetime.utcnow().isoformat(),
                "type": "poc_status_change"
            }
            
            result = self.client.trigger(channel, "poc-status-update", data)
            
            # Also notify individual company members
            if company_members:
                for user_id in company_members:
                    user_channel = f"user-{user_id}"
                    user_data = {
                        **data,
                        "company_id": company_id
                    }
                    self.client.trigger(user_channel, "notification", user_data)
            
            return result.get("status_code") == 200
            
        except Exception as e:
            print(f"Error sending POC status notification: {e}")
            return False
    
    async def notify_rfq_expiring_soon(
        self,
        rfq_id: str,
        rfq_title: str,
        expires_in_hours: int,
        interested_suppliers: List[str]
    ) -> bool:
        """
        Notify suppliers when RFQ is expiring soon
        """
        try:
            data = {
                "rfq_id": rfq_id,
                "rfq_title": rfq_title,
                "expires_in_hours": expires_in_hours,
                "timestamp": datetime.utcnow().isoformat(),
                "type": "rfq_expiring",
                "urgency": "high" if expires_in_hours <= 6 else "medium"
            }
            
            success_count = 0
            
            # Send to each interested supplier
            for supplier_user_id in interested_suppliers:
                channel = f"user-{supplier_user_id}"
                result = self.client.trigger(channel, "rfq-expiring", data)
                if result.get("status_code") == 200:
                    success_count += 1
            
            return success_count > 0
            
        except Exception as e:
            print(f"Error sending RFQ expiring notifications: {e}")
            return False
    
    async def notify_deal_milestone(
        self,
        rfq_id: str,
        milestone: str,  # "quote_accepted", "po_issued", "delivery_confirmed"
        participants: List[str],
        details: Dict[str, Any] = None
    ) -> bool:
        """
        Notify participants about deal milestones
        """
        try:
            data = {
                "rfq_id": rfq_id,
                "milestone": milestone,
                "details": details or {},
                "timestamp": datetime.utcnow().isoformat(),
                "type": "deal_milestone"
            }
            
            success_count = 0
            
            # Send to RFQ channel
            rfq_channel = f"rfq-{rfq_id}"
            result = self.client.trigger(rfq_channel, "deal-milestone", data)
            if result.get("status_code") == 200:
                success_count += 1
            
            # Send to all participants
            for user_id in participants:
                user_channel = f"user-{user_id}"
                result = self.client.trigger(user_channel, "notification", data)
                if result.get("status_code") == 200:
                    success_count += 1
            
            return success_count > 0
            
        except Exception as e:
            print(f"Error sending deal milestone notification: {e}")
            return False
    
    async def send_typing_indicator(
        self,
        rfq_id: str,
        user_id: str,
        user_name: str,
        is_typing: bool
    ) -> bool:
        """
        Send typing indicator for chat
        """
        try:
            channel = f"rfq-{rfq_id}-chat"
            event = "typing" if is_typing else "stop-typing"
            data = {
                "user_id": user_id,
                "user_name": user_name,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            result = self.client.trigger(channel, event, data)
            return result.get("status_code") == 200
            
        except Exception as e:
            print(f"Error sending typing indicator: {e}")
            return False
    
    async def broadcast_system_announcement(
        self,
        announcement: str,
        target_audience: str = "all",  # "all", "buyers", "suppliers"
        announcement_type: str = "info"  # "info", "warning", "maintenance"
    ) -> bool:
        """
        Broadcast system-wide announcements
        """
        try:
            data = {
                "announcement": announcement,
                "type": announcement_type,
                "target_audience": target_audience,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Send to general announcement channel
            channel = f"system-{target_audience}"
            result = self.client.trigger(channel, "announcement", data)
            
            return result.get("status_code") == 200
            
        except Exception as e:
            print(f"Error sending system announcement: {e}")
            return False
    
    async def notify_bulk_rfq_match(
        self,
        rfq_id: str,
        rfq_title: str,
        matched_suppliers: List[Dict[str, Any]]
    ) -> bool:
        """
        Notify multiple suppliers about RFQ match
        """
        try:
            success_count = 0
            
            for supplier in matched_suppliers:
                user_id = supplier.get("user_id")
                match_score = supplier.get("match_score", 0)
                
                if not user_id:
                    continue
                
                data = {
                    "rfq_id": rfq_id,
                    "rfq_title": rfq_title,
                    "match_score": match_score,
                    "match_reasons": supplier.get("match_reasons", []),
                    "timestamp": datetime.utcnow().isoformat(),
                    "type": "rfq_match",
                    "priority": "high" if match_score > 0.8 else "medium"
                }
                
                channel = f"user-{user_id}"
                result = self.client.trigger(channel, "rfq-match", data)
                
                if result.get("status_code") == 200:
                    success_count += 1
            
            return success_count > 0
            
        except Exception as e:
            print(f"Error sending bulk RFQ match notifications: {e}")
            return False
    
    def get_channel_info(self, channel: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a channel (number of subscribers, etc.)
        """
        try:
            result = self.client.get(f"/channels/{channel}")
            return result
            
        except Exception as e:
            print(f"Error getting channel info: {e}")
            return None
    
    def authenticate_private_channel(
        self,
        socket_id: str,
        channel_name: str,
        user_data: Dict[str, Any] = None
    ) -> Dict[str, str]:
        """
        Authenticate user for private channels
        """
        try:
            if user_data:
                auth = self.client.authenticate(
                    channel=channel_name,
                    socket_id=socket_id,
                    custom_data=user_data
                )
            else:
                auth = self.client.authenticate(
                    channel=channel_name,
                    socket_id=socket_id
                )
            
            return auth
            
        except Exception as e:
            print(f"Error authenticating private channel: {e}")
            return {"error": str(e)}


class WebSocketConnectionManager:
    """
    Manage WebSocket connections and channel subscriptions
    """
    
    def __init__(self):
        self.pusher = PusherService()
        self.active_connections: Dict[str, List[str]] = {}  # user_id -> [channels]
    
    def get_user_channels(self, user_id: str, user_role: str, company_id: str = None) -> List[str]:
        """
        Get list of channels a user should be subscribed to
        """
        channels = [
            f"user-{user_id}",  # Personal notifications
            "system-all"  # System announcements
        ]
        
        # Role-based channels
        if user_role in ["buyer", "supplier"]:
            channels.append(f"system-{user_role}s")
        
        # Company-specific channels
        if company_id:
            channels.append(f"company-{company_id}")
        
        return channels
    
    def get_rfq_channels(self, rfq_id: str) -> List[str]:
        """
        Get list of channels for RFQ-related communications
        """
        return [
            f"rfq-{rfq_id}",  # RFQ updates
            f"rfq-{rfq_id}-chat"  # RFQ chat
        ]
    
    async def subscribe_user_to_channels(
        self,
        user_id: str,
        socket_id: str,
        user_role: str,
        company_id: str = None
    ) -> List[str]:
        """
        Subscribe user to appropriate channels
        """
        channels = self.get_user_channels(user_id, user_role, company_id)
        self.active_connections[user_id] = channels
        
        return channels
    
    async def unsubscribe_user(self, user_id: str):
        """
        Clean up when user disconnects
        """
        if user_id in self.active_connections:
            del self.active_connections[user_id]


# Global instances
pusher_service = PusherService()
websocket_manager = WebSocketConnectionManager()