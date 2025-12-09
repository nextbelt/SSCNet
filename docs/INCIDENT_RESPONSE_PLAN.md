# INCIDENT RESPONSE PLAN
## Sourcing Supply Chain Net (SSCN)

**Version:** 1.0  
**Last Updated:** October 27, 2025  
**Owner:** Security Team  
**Review Cycle:** Quarterly

---

## 1. INCIDENT RESPONSE TEAM

### Primary Contacts:
- **Incident Commander:** [Name] - [Email] - [Phone]
- **Technical Lead:** [Name] - [Email] - [Phone]
- **Communications Lead:** [Name] - [Email] - [Phone]
- **Legal Counsel:** [Name] - [Email] - [Phone]

### Escalation Path:
1. Security Engineer (15 minutes)
2. Senior Engineer (30 minutes)
3. CTO (1 hour)
4. CEO (2 hours)

### External Contacts:
- **Railway Support:** support@railway.app
- **Legal Advisor:** [Contact]
- **PR/Communications:** [Contact]
- **Cyber Insurance:** [Contact]

---

## 2. INCIDENT CLASSIFICATION

### Severity Levels:

#### CRITICAL (P1) - Immediate Response Required
- Active data breach or unauthorized access
- Complete service outage
- Loss of critical data
- Ransomware attack
- Public disclosure of customer data

**Response Time:** 15 minutes  
**Notification Required:** CEO, Legal, All customers (if PII affected)

#### HIGH (P2) - Urgent Response
- Partial service outage
- Suspected security breach
- Significant performance degradation
- Failed security controls

**Response Time:** 1 hour  
**Notification Required:** CTO, Security Team

#### MEDIUM (P3) - Standard Response
- Minor service disruption
- Security policy violation
- Failed backup
- Configuration error

**Response Time:** 4 hours  
**Notification Required:** Engineering Team

#### LOW (P4) - Routine Response
- Individual user issue
- Minor bug or glitch
- Non-critical alert

**Response Time:** 24 hours  
**Notification Required:** Support Team

---

## 3. INCIDENT RESPONSE PHASES

### Phase 1: DETECTION & IDENTIFICATION (0-15 min)

**Actions:**
1. Incident reported via monitoring alert, user report, or security scan
2. Initial assessment by on-call engineer
3. Classify severity level
4. Create incident ticket with unique ID
5. Activate incident response team if P1 or P2

**Tools:**
- Sentry error tracking
- UptimeRobot monitoring alerts
- Railway platform alerts
- Audit logs in database

**Decision Point:** Is this a real incident or false positive?

---

### Phase 2: CONTAINMENT (15 min - 2 hours)

**Immediate Actions:**
- **For Security Breach:**
  1. Identify compromised accounts/systems
  2. Revoke all access tokens for affected users
  3. Force password reset for compromised accounts
  4. Enable IP blocking if needed
  5. Isolate affected services/databases
  
- **For Service Outage:**
  1. Identify failing component
  2. Enable maintenance mode if needed
  3. Route traffic to backup if available
  4. Scale resources if capacity issue

**Tools:**
- Railway service controls
- Database access revocation
- JWT token invalidation
- Rate limiting adjustments

**Communication:**
- Internal: Slack #incidents channel
- External: Status page update (if P1/P2)

---

### Phase 3: ERADICATION (2-8 hours)

**Actions:**
1. Identify root cause
2. Remove malicious code/access
3. Patch vulnerabilities
4. Update security rules
5. Scan for additional compromises

**For Data Breach:**
- Review audit logs for extent of access
- Identify all affected data/users
- Document timeline of compromise
- Preserve evidence for forensics

**Documentation:**
- Timeline of events
- Systems/data affected
- Actions taken
- Evidence collected

---

### Phase 4: RECOVERY (4-24 hours)

**Actions:**
1. Restore services from backups if needed
2. Verify data integrity
3. Gradually restore access
4. Monitor for recurrence
5. Conduct security scan

**Verification Steps:**
- [ ] All services operational
- [ ] No unauthorized access detected
- [ ] Security controls functioning
- [ ] Monitoring alerts normal
- [ ] Customer access restored

**Before declaring resolved:**
- CTO approval required for P1/P2
- Monitoring period: 24 hours minimum

---

### Phase 5: POST-INCIDENT REVIEW (1-7 days after)

**Required for P1/P2, Optional for P3/P4:**

**Post-Incident Report Must Include:**
1. Executive Summary
2. Timeline of events
3. Root cause analysis
4. Impact assessment
5. Actions taken
6. Lessons learned
7. Preventive measures
8. Action items with owners

**Review Meeting:**
- Within 48 hours for P1
- Within 7 days for P2
- All incident response team members
- Document and implement improvements

---

## 4. DATA BREACH RESPONSE (GDPR/CCPA)

### 72-Hour Notification Timeline:

**0-4 Hours: Initial Assessment**
- Identify type of data compromised
- Estimate number of affected individuals
- Assess risk to individuals
- Determine if notification required

**4-24 Hours: Investigation**
- Review audit logs
- Identify breach timeline
- Document affected systems
- Preserve evidence
- Engage legal counsel

**24-48 Hours: Preparation**
- Draft notification letters
- Prepare FAQ for support team
- Set up dedicated support line
- Coordinate with PR team

**48-72 Hours: Notification**
- Notify supervisory authority (GDPR - within 72 hours)
- Notify affected individuals (CCPA - without unreasonable delay)
- Update privacy policy if needed
- Post public statement if required

### Notification Content Requirements:

**To Data Protection Authority:**
- Nature of the breach
- Categories and approximate number of affected individuals
- Likely consequences
- Measures taken or proposed
- Contact point for more information

**To Affected Individuals:**
- Description of breach in plain language
- Type of data involved
- Likely consequences
- Steps taken to mitigate
- Recommended actions for individuals
- Contact information for questions

---

## 5. COMMUNICATION TEMPLATES

### Internal Alert (Slack/Email):
```
🚨 INCIDENT ALERT - [Severity]
ID: INC-[YYYYMMDD]-[###]
Time: [Timestamp]
Type: [Security/Outage/Data]
Status: [Detected/Investigating/Contained/Resolved]
Summary: [Brief description]
Impact: [Affected systems/users]
Response Team: @[members]
War Room: [Link]
Updates: [Frequency]
```

### External Status Update:
```
We are currently experiencing [issue] affecting [services].
Our team is actively working to resolve this.
We will provide updates every [timeframe].
Last Updated: [Timestamp]
```

### Customer Data Breach Notification:
```
Subject: Important Security Notice Regarding Your SSCN Account

Dear [Name],

We are writing to inform you of a security incident that may have affected your personal information.

[What Happened]
[What Information Was Involved]
[What We're Doing]
[What You Should Do]
[How to Contact Us]

We sincerely apologize for this incident and are committed to protecting your information.

Sincerely,
SSCN Security Team
```

---

## 6. TOOLS & ACCESS

### Monitoring & Alerting:
- **Sentry:** https://sentry.io/[org]/sscn
- **UptimeRobot:** https://uptimerobot.com/dashboard
- **Railway:** https://railway.app/project/[id]

### Audit Logs:
```sql
-- Recent security events
SELECT * FROM audit_logs 
WHERE action LIKE '%security%' 
  OR action LIKE '%login%'
ORDER BY timestamp DESC 
LIMIT 100;

-- Failed login attempts
SELECT user_email, COUNT(*) as attempts
FROM audit_logs
WHERE action = 'user.login.failed'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY user_email
HAVING COUNT(*) >= 5;
```

### Emergency Access Revocation:
```python
# Revoke all access tokens for a user
from app.models.user import User
user = db.query(User).filter(User.email == "compromised@example.com").first()
user.is_active = False
user.locked_until = datetime.utcnow() + timedelta(hours=24)
db.commit()
```

---

## 7. REGULATORY REPORTING

### GDPR (EU):
- **Authority:** [Your country's supervisory authority]
- **Notification:** Within 72 hours of becoming aware
- **Method:** [Portal/Email]
- **Contact:** [Authority contact]

### CCPA (California):
- **Attorney General:** oag.ca.gov
- **Notification:** Without unreasonable delay
- **Method:** Written notice or email

### Other Jurisdictions:
- Document state/country-specific requirements
- Update as regulations change

---

## 8. TESTING & DRILLS

### Quarterly Tabletop Exercises:
- Simulate breach scenarios
- Test team response
- Identify gaps
- Update procedures

### Annual Full Drill:
- Simulate real incident
- Test all procedures
- External stakeholder involvement
- Full post-incident review

### Next Scheduled Drill:
- Date: [TBD]
- Scenario: [TBD]
- Participants: [TBD]

---

## 9. CONTINUOUS IMPROVEMENT

### After Each Incident:
- Update this plan if gaps identified
- Implement preventive measures
- Train team on new procedures
- Communicate changes

### Quarterly Review:
- Review incident statistics
- Update contact information
- Verify escalation paths
- Test communication tools

---

## APPENDIX A: INCIDENT RESPONSE CHECKLIST

### For Security Incidents:
- [ ] Incident detected and classified
- [ ] Incident response team activated
- [ ] Affected systems identified
- [ ] Access revoked/systems isolated
- [ ] Audit logs reviewed
- [ ] Evidence preserved
- [ ] Root cause identified
- [ ] Vulnerability patched
- [ ] Services restored
- [ ] Monitoring confirmed normal
- [ ] Customers notified (if required)
- [ ] Authorities notified (if required)
- [ ] Post-incident report completed
- [ ] Preventive measures implemented

---

**Last Updated:** October 27, 2025  
**Next Review:** January 27, 2026  
**Document Owner:** Security Team
