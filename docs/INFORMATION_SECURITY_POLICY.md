# INFORMATION SECURITY POLICY
## Sourcing Supply Chain Net (SSCN)

**Version:** 1.0  
**Effective Date:** October 27, 2025  
**Last Reviewed:** October 27, 2025  
**Next Review:** April 27, 2026  
**Owner:** Chief Technology Officer  
**Classification:** Internal

---

## 1. PURPOSE AND SCOPE

### 1.1 Purpose
This Information Security Policy establishes the framework for protecting SSCN's information assets, including customer data, business information, and system resources, in accordance with SOC 2 Trust Service Criteria and applicable data protection regulations (GDPR, CCPA).

### 1.2 Scope
This policy applies to:
- All employees, contractors, and third-party service providers
- All information systems, networks, and data owned or operated by SSCN
- All business operations, both physical and virtual
- All customer and supplier data processed by the platform

### 1.3 Policy Objectives
- Protect confidentiality, integrity, and availability of information assets
- Comply with SOC 2, GDPR, CCPA, and other regulatory requirements
- Minimize business risk from security incidents
- Maintain customer trust through demonstrated security practices
- Enable secure business operations

---

## 2. ROLES AND RESPONSIBILITIES

### 2.1 Chief Executive Officer (CEO)
- Ultimate accountability for information security
- Approve security policies and major investments
- Ensure adequate resources for security program

### 2.2 Chief Technology Officer (CTO)
- Overall responsibility for security program
- Approve technical security controls
- Lead incident response for major incidents
- Report security status to CEO quarterly

### 2.3 Security Lead
- Day-to-day management of security controls
- Monitor security alerts and logs
- Conduct security assessments
- Manage security documentation
- Coordinate incident response

### 2.4 Engineering Team
- Implement security controls in code
- Follow secure development practices
- Respond to security issues promptly
- Participate in security training

### 2.5 All Employees
- Protect company and customer information
- Report security incidents immediately
- Complete annual security training
- Follow all security policies and procedures

---

## 3. INFORMATION CLASSIFICATION

### 3.1 Classification Levels

#### PUBLIC
- **Definition:** Information intended for public disclosure
- **Examples:** Marketing materials, press releases, product information
- **Controls:** Standard web security, version control

#### INTERNAL
- **Definition:** Information for internal use only
- **Examples:** Internal procedures, project plans, non-sensitive analytics
- **Controls:** Authentication required, logging enabled

#### CONFIDENTIAL
- **Definition:** Sensitive business or customer information
- **Examples:** Customer PII, RFQ details, financial records, supplier quotes
- **Controls:** Encryption at rest, encryption in transit, access controls, audit logging, MFA for access

#### RESTRICTED
- **Definition:** Highly sensitive information requiring maximum protection
- **Examples:** Passwords, encryption keys, payment information, security configurations
- **Controls:** All CONFIDENTIAL controls plus: field-level encryption, need-to-know access only, separate key management, no email transmission

### 3.2 Data Handling Requirements

| Classification | Storage | Transmission | Disposal |
|----------------|---------|--------------|----------|
| PUBLIC | Any approved system | Any method | Standard deletion |
| INTERNAL | Company systems only | Internal channels | Secure deletion |
| CONFIDENTIAL | Encrypted database, encrypted S3 | TLS 1.3, VPN | Secure deletion + audit log |
| RESTRICTED | Encrypted + field encryption | TLS 1.3 only, no email | Cryptographic erasure + audit log |

---

## 4. ACCESS CONTROL

### 4.1 User Access Management

#### 4.1.1 User Provisioning
- All access requests must be approved by manager
- Admin access requires CTO approval
- Access provisioned within 24 hours of approval
- Principle of least privilege enforced

#### 4.1.2 Authentication Requirements
- **Standard Users:**
  - Unique user ID (email address)
  - Password meeting complexity requirements (12+ chars, uppercase, lowercase, number, special char)
  - Optional: Multi-Factor Authentication (MFA)

- **Admin Users:**
  - All standard requirements PLUS
  - Mandatory Multi-Factor Authentication (TOTP or backup codes)
  - MFA enrollment within 48 hours of admin access grant

- **System Accounts:**
  - API keys rotated every 90 days
  - Service accounts with unique credentials
  - No shared credentials

#### 4.1.3 Password Policy
- **Minimum Length:** 12 characters
- **Complexity:** Must include uppercase, lowercase, number, and special character
- **Expiration:** Optional (modern best practice: no expiration if strong and unique)
- **Reuse:** Cannot reuse last 5 passwords (future implementation)
- **Lockout:** Account locked after 5 failed attempts for 15 minutes
- **Storage:** Bcrypt hashing with 12 rounds minimum

#### 4.1.4 Session Management
- **Idle Timeout:** 30 minutes of inactivity
- **Absolute Timeout:** 24 hours maximum session duration
- **Concurrent Sessions:** Multiple sessions allowed, all tracked
- **Token Refresh:** Automatic token rotation on refresh

#### 4.1.5 User Deprovisioning
- Access revoked within 4 hours of termination
- Manager notified via email
- Audit log created
- All sessions invalidated
- Company data returned or destroyed

### 4.2 Access Reviews
- Quarterly review of all user access
- Annual review of admin access
- Role-based access control (RBAC) enforced
- Segregation of duties for critical functions

---

## 5. DATA PROTECTION

### 5.1 Encryption Standards

#### 5.1.1 Data at Rest
- **Database:** AES-256 encryption (Railway PostgreSQL managed encryption)
- **File Storage:** AES-256 encryption (AWS S3 SSE-S3)
- **Field-Level:** Fernet symmetric encryption for PII (email, names, LinkedIn IDs)
- **Backups:** Encrypted with GPG (AES-256)

#### 5.1.2 Data in Transit
- **Web Traffic:** TLS 1.3 minimum, HTTPS redirect enforced
- **API Communication:** TLS 1.3 only
- **Database Connections:** TLS/SSL required
- **Internal Services:** VPN or TLS

#### 5.1.3 Key Management
- Secret keys stored in environment variables (Railway Secrets)
- Never committed to source code
- Rotated annually or upon suspected compromise
- Separate keys for development, staging, and production

### 5.2 Data Privacy

#### 5.2.1 Personal Information (PII)
- **Collected:** Email, name, company, LinkedIn ID, phone (optional), IP address (logs)
- **Legal Basis:** Contract performance, legitimate interest, consent
- **Retention:** Active accounts indefinitely, deleted accounts 30-day grace then permanent deletion
- **Encryption:** Field-level encryption for all PII

#### 5.2.2 User Rights (GDPR/CCPA)
- **Right to Access:** Export all user data via API
- **Right to Rectification:** Update profile anytime
- **Right to Erasure:** Request account deletion (30-day grace period)
- **Right to Portability:** JSON export of all data
- **Right to Withdraw Consent:** Disable MFA, manage cookie preferences, delete account

#### 5.2.3 Data Minimization
- Collect only data necessary for business purpose
- No sensitive categories (race, religion, health, etc.)
- Anonymize analytics data where possible

#### 5.2.4 Third-Party Data Sharing
- **LinkedIn API:** User authentication only (OAuth 2.0)
- **AWS S3:** Document storage only
- **SendGrid:** Transactional emails only
- **Sentry:** Error monitoring (PII filtered)
- **Railway:** Infrastructure hosting
- Data Processing Agreements (DPAs) required with all vendors

### 5.3 Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| Active user accounts | Indefinite | N/A |
| Deleted user accounts | 30 days (grace) then deleted | Secure deletion |
| Audit logs | 7 years | Archived then deleted |
| Backup files (automated) | 7 days | Automatic deletion |
| Backup archives (manual) | 7 years | Secure deletion after |
| RFQ data | Until deleted by user | Secure deletion |
| Analytics data | 2 years | Anonymized then retained |

---

## 6. SECURE DEVELOPMENT

### 6.1 Secure Coding Practices
- Input validation for all user inputs
- Output encoding to prevent XSS
- Parameterized queries to prevent SQL injection
- CSRF tokens for state-changing operations
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Dependency scanning for vulnerabilities

### 6.2 Code Review Requirements
- All code changes reviewed by at least one other developer
- Security-sensitive changes reviewed by Security Lead
- Automated testing required before merge
- Static code analysis (future: SonarQube or similar)

### 6.3 Development Environment Security
- Development on separate infrastructure from production
- No production data in development
- Secrets management (never in code)
- Git commit signing (recommended)
- Protected main branch (no direct commits)

### 6.4 Change Management
- All changes tracked in version control (Git)
- Documented change approval process
- Rollback procedures tested
- Post-deployment verification

---

## 7. SYSTEM SECURITY

### 7.1 Infrastructure Security
- **Hosting:** Railway cloud platform (SOC 2 certified)
- **Database:** Railway PostgreSQL with automatic backups
- **File Storage:** AWS S3 with versioning and cross-region replication
- **CDN:** Cloudflare (recommended for future)
- **Monitoring:** Sentry for error tracking, UptimeRobot for availability

### 7.2 Network Security
- TLS 1.3 enforced for all connections
- Rate limiting (60 requests/minute per IP)
- DDoS protection (Railway + future Cloudflare)
- No direct database access from internet
- VPN required for admin access (future implementation)

### 7.3 Logging and Monitoring
- **Audit Logging:** All authentication, data modifications, security events
- **Error Monitoring:** Sentry with PII filtering
- **Uptime Monitoring:** Health check endpoint + external monitoring
- **Log Retention:** 7 years for audit logs, 90 days for application logs
- **Log Access:** Restricted to authorized personnel only

### 7.4 Vulnerability Management
- Automated dependency scanning (Dependabot)
- Monthly manual security review
- Annual penetration testing
- Critical vulnerabilities patched within 24 hours
- High vulnerabilities patched within 7 days
- Medium/Low vulnerabilities patched within 30 days

### 7.5 Patch Management
- Security patches applied within 30 days of release
- Testing in staging before production deployment
- Emergency patching procedure for zero-day vulnerabilities
- Quarterly operating system and platform updates

---

## 8. PHYSICAL AND ENVIRONMENTAL SECURITY

### 8.1 Data Center Security (Railway/AWS)
- SOC 2 Type II certified facilities
- 24/7 physical security
- Biometric access controls
- Environmental controls (power, cooling, fire suppression)
- Redundant systems for availability

### 8.2 Office Security
- Locked doors when unoccupied
- Visitor log maintained
- Clean desk policy for sensitive documents
- Screen lock after 10 minutes of inactivity
- Encryption required on all laptops

### 8.3 Equipment Security
- Company laptops with full disk encryption
- Antivirus software required
- Automatic security updates enabled
- Remote wipe capability for lost/stolen devices
- Secure disposal of old equipment

---

## 9. INCIDENT RESPONSE

### 9.1 Incident Classification
- **P1 (Critical):** Active breach, data loss, complete outage - 15 min response
- **P2 (High):** Suspected breach, partial outage - 1 hour response
- **P3 (Medium):** Minor disruption, failed control - 4 hour response
- **P4 (Low):** Individual user issue, minor bug - 24 hour response

### 9.2 Incident Response Team
- **Incident Commander:** CTO
- **Technical Lead:** Engineering Lead
- **Communications Lead:** CEO or designee
- **Legal Counsel:** External legal advisor

### 9.3 Incident Response Process
1. **Detection:** Via monitoring, user report, or security scan (0-15 min)
2. **Containment:** Isolate affected systems, revoke access (15 min - 2 hours)
3. **Eradication:** Remove threat, patch vulnerability (2-8 hours)
4. **Recovery:** Restore services, verify integrity (4-24 hours)
5. **Post-Incident Review:** Document lessons learned (1-7 days)

### 9.4 Breach Notification
- **GDPR:** Notify supervisory authority within 72 hours
- **CCPA:** Notify affected individuals without unreasonable delay
- **All Breaches:** Notify affected customers, document in audit log
- **Public Disclosure:** If required by law or affects >500 individuals

**Full Incident Response Plan:** See `INCIDENT_RESPONSE_PLAN.md`

---

## 10. BUSINESS CONTINUITY

### 10.1 Backup Strategy
- **Database:** Daily automated backups (7-day retention)
- **Files:** S3 versioning (30-day retention) + cross-region replication
- **Configuration:** Git version control + encrypted exports
- **Testing:** Monthly backup restoration tests

### 10.2 Disaster Recovery
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 1 hour
- **Backup Location:** Railway backups + AWS S3 separate region
- **DR Plan Testing:** Quarterly tabletop exercises, annual full drill

**Full Backup and Recovery Plan:** See `BACKUP_RECOVERY_PLAN.md`

---

## 11. THIRD-PARTY RISK MANAGEMENT

### 11.1 Vendor Assessment
- **Pre-Contract:** Security questionnaire, SOC 2 review
- **Contract Requirements:** Data Processing Agreement (DPA), SLA
- **Ongoing:** Annual SOC 2 review, quarterly security updates

### 11.2 Critical Vendors

| Vendor | Service | SOC 2 | DPA | Risk Level |
|--------|---------|-------|-----|------------|
| Railway | Infrastructure | ✅ Yes | ✅ Required | Medium |
| AWS | File Storage | ✅ Yes | ✅ Required | Medium |
| SendGrid | Email | ✅ Yes | ✅ Required | Low |
| Sentry | Monitoring | ✅ Yes | ✅ Required | Low |
| LinkedIn | API | ✅ Yes | ✅ Required | Medium |

### 11.3 Vendor Termination
- Data deletion within 30 days
- Confirmation of deletion received
- Access credentials revoked
- DPA termination documented

---

## 12. TRAINING AND AWARENESS

### 12.1 Security Training Requirements
- **New Hires:** Security orientation within first week
- **All Employees:** Annual security awareness training
- **Developers:** Secure coding training annually
- **Admin Users:** Advanced security training annually

### 12.2 Training Topics
- Password security and MFA usage
- Phishing and social engineering
- Data classification and handling
- Incident reporting procedures
- Privacy regulations (GDPR/CCPA)
- Secure development practices (for developers)

### 12.3 Security Awareness Program
- Monthly security tips via email
- Quarterly security newsletter
- Simulated phishing exercises (future)
- Security champions program (future)

---

## 13. ACCEPTABLE USE POLICY

### 13.1 Permitted Use
- Business purposes only
- Compliance with all policies and laws
- Respect for intellectual property
- Professional and ethical conduct

### 13.2 Prohibited Activities
- Unauthorized access to systems or data
- Sharing of credentials
- Installation of unauthorized software
- Use of company resources for personal gain
- Harassment or offensive content
- Circumventing security controls
- Storing illegal or inappropriate content

### 13.3 Internet and Email Use
- Professional use of company email
- No transmission of sensitive data via unencrypted email
- No accessing inappropriate websites
- Personal use limited and reasonable

### 13.4 Device Usage
- Company devices for business use primarily
- Personal devices require approval (BYOD policy)
- All devices must have up-to-date security software
- Report lost or stolen devices immediately

---

## 14. COMPLIANCE

### 14.1 Regulatory Requirements
- **SOC 2:** Annual Type II audit
- **GDPR:** EU data protection regulation
- **CCPA:** California Consumer Privacy Act
- **PCI DSS:** If processing payments (future)

### 14.2 Policy Compliance
- All employees must acknowledge policy annually
- Violations reported to management
- Disciplinary action for policy violations
- Termination for severe or repeated violations

### 14.3 Audit and Assessment
- **Internal Audits:** Quarterly security control reviews
- **External Audits:** Annual SOC 2 audit
- **Penetration Testing:** Annual external penetration test
- **Vulnerability Scanning:** Monthly automated scans

---

## 15. POLICY GOVERNANCE

### 15.1 Policy Maintenance
- **Review Cycle:** Every 6 months
- **Updates:** As needed for regulatory changes or incidents
- **Approval:** CTO for minor changes, CEO for major changes
- **Communication:** All employees notified of policy changes

### 15.2 Policy Exceptions
- Must be requested in writing
- Require CTO approval
- Documented with business justification
- Reviewed quarterly
- Compensating controls required

### 15.3 Policy Violations
- Reported to Security Lead or CTO
- Investigated promptly
- Documented in incident log
- Appropriate disciplinary action taken

---

## 16. CONTACT INFORMATION

### Security Team
- **Security Lead:** [Name] - security@sscn.com
- **CTO:** [Name] - cto@sscn.com
- **Privacy Officer:** [Name] - privacy@sscn.com

### Incident Reporting
- **Email:** security@sscn.com
- **Phone:** [Emergency number]
- **After Hours:** [On-call number]

### Policy Questions
- **Email:** compliance@sscn.com
- **Intranet:** [Internal documentation site]

---

## APPENDIX A: DEFINITIONS

- **Authentication:** Verifying the identity of a user or system
- **Authorization:** Granting access rights to authenticated users
- **Confidentiality:** Protecting information from unauthorized disclosure
- **Encryption:** Converting data to unreadable format without decryption key
- **Integrity:** Ensuring data is accurate and unmodified
- **PII (Personally Identifiable Information):** Data that can identify an individual
- **SOC 2:** Service Organization Control 2 - security and privacy audit framework
- **TLS (Transport Layer Security):** Cryptographic protocol for secure communication
- **Two-Factor Authentication (2FA/MFA):** Authentication using two methods

---

## APPENDIX B: POLICY ACKNOWLEDGMENT

I acknowledge that I have read, understood, and agree to comply with the SSCN Information Security Policy. I understand that violation of this policy may result in disciplinary action up to and including termination of employment or contract.

**Employee Name:** ________________________________

**Signature:** ________________________________

**Date:** ________________________________

---

## DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-27 | Security Team | Initial release for SOC 2 compliance |

**Next Review Date:** April 27, 2026  
**Document Classification:** Internal  
**Document Owner:** Chief Technology Officer

---

**This policy is effective immediately and supersedes all previous security policies.**
