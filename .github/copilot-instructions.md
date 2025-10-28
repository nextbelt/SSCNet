# Sourcing Supply Chain Net - Project Instructions

## Project Overview
This is a comprehensive B2B supply chain sourcing platform with LinkedIn API integration, verified POCs (Points of Contact), and real-time RFQ (Request for Quote) management.

## Architecture
- **Backend**: FastAPI with Python
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: LinkedIn OAuth 2.0 + JWT
- **Real-time**: WebSockets with Pusher/Ably
- **File Storage**: AWS S3
- **Email**: SendGrid
- **Search**: Elasticsearch
- **Analytics**: Mixpanel/Amplitude

## Key Features
- LinkedIn authentication and verification
- Company profile management with POCs
- RFQ creation and response system
- Real-time messaging
- Advanced supplier search
- Document management
- Analytics and reporting

## Development Guidelines
- Use type hints and proper error handling
- Implement comprehensive API documentation
- Follow security best practices (SOC 2 compliance)
- Rate limiting and data validation
- Comprehensive testing coverage

## Checklist Status
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [ ] Launch the Project
- [x] Ensure Documentation is Complete