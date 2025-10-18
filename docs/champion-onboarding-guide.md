# Champion User Onboarding Guide

## Overview
This guide walks through the complete onboarding process for a Champion user (e.g., Head Chef, Operations Manager) who wants to evaluate JiGR for their business owner.

## The Champion Scenario
**Situation**: A Head Chef discovers JiGR and wants to demonstrate its value to the business owner before they make a purchasing decision. The Champion needs full evaluation capabilities while maintaining appropriate security boundaries.

---

## Step-by-Step Champion Onboarding

### Phase 1: Initial Registration & Setup

#### Step 1: Champion Discovers JiGR
- Champion (Head Chef) finds JiGR through marketing/referral
- Visits landing page and clicks "Start Free Trial"
- **Key Point**: Champion doesn't own the business but has operational authority

#### Step 2: Account Creation
1. Champion fills out registration form:
   - Name: "Chef Maria Rodriguez"
   - Email: "maria@restaurantname.com"
   - Position: "Head Chef" (this is critical)
   - Company: "Bella Vista Restaurant"
   - Phone: Optional

2. **System Logic**: 
   - System detects this is NOT the business owner
   - Automatically assigns **CHAMPION role** (not OWNER)
   - Creates evaluation mode client with 30-day trial

#### Step 3: Champion Welcome Flow
1. Champion receives welcome email explaining:
   - Their role as evaluation champion
   - 30-day evaluation period
   - Goal: Configure system to show value to owner
   - Incentives for successful handoff

2. **First Login Experience**:
   - Dashboard shows "Champion Evaluation Mode" banner
   - Success score starts at 0%
   - Clear call-to-action: "Start Configuration"

### Phase 2: Configuration & Evaluation

#### Step 4: Business Structure Setup
Champion configures their restaurant's structure:

1. **Departments Configuration**:
   - Kitchen Operations
   - Front of House
   - Management
   - Delivery & Storage

2. **Job Title Configuration**:
   - Head Chef (MANAGER level)
   - Sous Chef (SUPERVISOR level)
   - Line Cook (STAFF level)
   - Server (STAFF level)
   - Restaurant Manager (MANAGER level)

3. **Security Level Assignment**:
   - Champion can set temporary security levels
   - These require owner approval before becoming permanent

#### Step 5: Team Member Setup (Trial)
Champion adds team members for evaluation:

1. **Add Key Team Members**:
   - Sous Chef: "Carlos Martinez"
   - Lead Server: "Sarah Johnson"
   - Assistant Manager: "Mike Thompson"

2. **System Logic**:
   - These are marked as "evaluation mode" users
   - Limited access until owner approval
   - Champion gets success points for each addition

#### Step 6: Compliance Workflow Configuration
Champion sets up delivery compliance workflows:

1. **Temperature Monitoring Rules**:
   - Frozen: -18°C to -15°C
   - Chilled: 1°C to 4°C
   - Hot delivery: >63°C

2. **Delivery Documentation**:
   - Upload sample delivery dockets
   - Configure approval workflows
   - Set up notification rules

### Phase 3: Value Demonstration

#### Step 7: Success Score Building
As Champion completes configuration:

- **Configuration Quality (40 points)**:
  - Departments configured: +10 points each
  - Job titles defined: +5 points each
  - Security levels set: +10 points

- **Value Articulation (30 points)**:
  - Sample workflows created: +15 points
  - ROI calculations viewed: +10 points
  - Documentation uploaded: +5 points

- **Readiness Indicators (30 points)**:
  - Team members added: +5 points each
  - Owner invitation prepared: +15 points

#### Step 8: ROI Analysis & Value Calculation
System automatically calculates potential value:

- **Time Savings**: 
  - Manual compliance checks: 2 hours/day → 15 minutes/day
  - Documentation process: 45 minutes → 5 minutes
  - **Total**: 12.5 hours saved per week

- **Risk Reduction**:
  - Food safety compliance: 85% improvement
  - Audit preparation: 90% faster
  - **Value**: $12,500 annual risk reduction

- **Efficiency Gains**:
  - Delivery processing: 60% faster
  - Team coordination: 40% improvement

### Phase 4: Owner Invitation & Handoff

#### Step 9: Prepare Owner Invitation
When Champion reaches 75%+ success score:

1. **Owner Information Collection**:
   - Owner Name: "Giuseppe Rossi"
   - Owner Email: "giuseppe@bellavista.com"
   - Relationship: "Restaurant Owner"
   - Preferred Contact: Email
   - Timeline: "Within 2 weeks"

2. **Evaluation Summary Generation**:
   ```
   Configuration Progress:
   ✅ 4 departments configured
   ✅ 5 job roles defined with security levels
   ✅ 3 team members added for testing
   ✅ 5 compliance workflows mapped
   
   Potential Value:
   💰 12.5 hours saved weekly
   📊 85% compliance improvement
   🛡️ $12,500 risk reduction annually
   ⚡ 60% efficiency gain
   
   Readiness Score: 87%
   ```

#### Step 10: Send Owner Invitation
Champion clicks "Invite Owner" and system:

1. **Creates Invitation Record**:
   - Generates unique invitation token
   - Sets 14-day expiration
   - Stores evaluation summary

2. **Sends Professional Email**:
   - Subject: "Maria has set up JiGR for Bella Vista - Review & Approve"
   - Includes evaluation summary
   - Clear review link with tracking
   - Professional presentation of value

3. **Engagement Tracking Activated**:
   - Email open tracking pixel
   - Link click tracking
   - Review progress monitoring

### Phase 5: Owner Review & Decision

#### Step 11: Owner Engagement Monitoring
Champion receives real-time notifications:

- **Email Opened**: "👀 Giuseppe opened your invitation!"
- **Link Clicked**: "🚀 Giuseppe clicked the review link!"
- **Review Started**: "📋 Giuseppe is reviewing your configuration!"

#### Step 12: Owner Review Experience
Owner clicks review link and sees:

1. **Progressive Disclosure Interface**:
   - Configuration overview
   - Value demonstration
   - Team structure review
   - Approval workflow

2. **Owner Decision Options**:
   - ✅ "Approve & Activate"
   - 📝 "Request Changes"
   - ❌ "Decline"

#### Step 13: Ownership Transfer (Success Case)
When owner approves:

1. **System Automatically**:
   - Removes evaluation mode
   - Transfers ownership to Giuseppe
   - Downgrades Maria to MANAGER role
   - Activates all configured settings
   - Triggers billing setup

2. **Champion Rewards Activated**:
   - $50 approval bonus
   - Professional certification badge
   - Case study eligibility
   - Community access

### Phase 6: Post-Handoff Benefits

#### Step 14: Champion Ongoing Value
After successful handoff:

1. **Retained Privileges**:
   - Power User status
   - Priority support access
   - Feature vote credits

2. **Career Benefits**:
   - LinkedIn certification badge
   - Champion community access
   - Speaking/content opportunities

3. **Financial Incentives**:
   - $150 when owner activates subscription
   - Revenue share for multi-location deals
   - Referral bonuses for other champions

---

## Testing Checklist

### Champion Registration
- [ ] Champion can register with non-owner position
- [ ] System assigns CHAMPION role automatically
- [ ] Evaluation mode client created
- [ ] Welcome email sent with champion-specific content

### Configuration Phase
- [ ] Champion can configure departments
- [ ] Job titles with security levels work
- [ ] Team member invitations in evaluation mode
- [ ] Success score updates in real-time

### Owner Invitation
- [ ] Invitation form captures all required data
- [ ] Evaluation summary generates correctly
- [ ] Email sends with tracking pixels
- [ ] Champion receives engagement notifications

### Owner Review
- [ ] Review link works with invitation token
- [ ] Progressive disclosure interface loads
- [ ] Owner can approve/decline/request changes
- [ ] Ownership transfer completes successfully

### Incentives & Rewards
- [ ] Achievements unlock based on progress
- [ ] Rewards are claimable when criteria met
- [ ] Financial incentives track properly
- [ ] Post-handoff privileges activate

---

## Key Success Metrics

1. **Champion Engagement**: 75%+ success score achieved
2. **Owner Response**: Email opened within 48 hours
3. **Conversion Rate**: Owner approval within 14 days
4. **Value Demonstration**: ROI calculations compelling
5. **Handoff Quality**: Smooth ownership transfer

## Support & Troubleshooting

- **Champion gets stuck**: Success score indicators guide next steps
- **Owner doesn't respond**: Engagement tracking shows if email was opened
- **Configuration issues**: Champion can request support without involving owner
- **Technical problems**: Champion panic button for immediate help

This flow ensures Champions can thoroughly evaluate JiGR while maintaining appropriate business boundaries and providing clear value demonstration to decision-makers.