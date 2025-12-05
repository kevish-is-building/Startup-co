"use client"

import { useState, useEffect } from 'react';
import { FileText, Search, Loader2 } from 'lucide-react';
import Header from '../../components/Header';
import TemplateCard from '../../components/TemplateCard';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Template } from '../../lib/types';
import { useSession } from '../../lib/auth-client';

// Static templates data - Standard legal templates provided to all users
const STANDARD_TEMPLATES: Template[] = [
  {
    id: "template-cofounders",
    title: "Co-Founders Agreement",
    description: "Comprehensive co-founders agreement with equity split, vesting schedule, roles, compensation, and exit provisions",
    category: "legal",
    fileType: "docx",
    industry: "all",
    content: `CO-FOUNDERS AGREEMENT

Date: [_______________]

BETWEEN:
[CO-FOUNDER 1 NAME], residing at [ADDRESS]
[CO-FOUNDER 2 NAME], residing at [ADDRESS]
[CO-FOUNDER 3 NAME] (if applicable), residing at [ADDRESS]

1. COMPANY OVERVIEW
Company Name: [_______________]
Business Description: [_______________]
Objective: [_______________]
Incorporation as: [_______________]
Business Model: [B2B/B2C/Other: _______________]

2. EQUITY OWNERSHIP
Founder          Equity Stake    Shares    Vesting Terms
Founder 1        _____ %        [___]     [specify]
Founder 2        _____ %        [___]     [specify]
Founder 3        _____ %        [___]     [specify]
TOTAL            100%

Capital Contribution:
Founder          Cash           In-Kind    Total
Founder 1        ₹ _____        [___]      ₹ _____
Founder 2        ₹ _____        [___]      ₹ _____
Founder 3        ₹ _____        [___]      ₹ _____

Deadline: [_______________]

3. EQUITY VESTING
Vesting Period: 4 years
Cliff: 1 year
Schedule: Monthly/Quarterly/Annual
Monthly Rate: 1/48 of total (if 4-year)

Breakdown:
- Year 1: 0% (Cliff)
- Year 2: 25%
- Year 3: 50%
- Year 4: 100%

Acceleration:
- Full acceleration on: [IPO/Acquisition/Other]
- Single-trigger: [conditions]
- Double-trigger: [conditions]

Unvested Equity:
- Early departure: Forfeited to company
- Vested shares: Founder keeps (buy-back option may apply)
- Buy-back price: [Fair market value/Formula]

4. FOUNDER ROLES
Founder    Title           Responsibilities    Authority
Founder 1  [CEO/CTO/CFO]  [duties]           [scope]
Founder 2  [CEO/CTO/CFO]  [duties]           [scope]
Founder 3  [CEO/CTO/CFO]  [duties]           [scope]

Flexibility:
- Roles change with unanimous consent
- Can take additional responsibilities
- Compensation tied to roles

5. TIME COMMITMENT & EXCLUSIVITY
Commitment:
- [Full-time/Part-time]
- Minimum: 40+ hours/week
- Focus: Primarily on company

Non-Compete:
- Duration: [___] months post-departure
- Cannot engage in competing business
- Cannot accept external employment without consent

Outside Activities:
- Teaching, writing allowed with approval
- Cannot consume >10% of time
- Must disclose outside income

6. COMPENSATION
Founder    Salary      Equity    Bonus    Total
Founder 1  ₹ [__]     [_]%      [__]     ₹ [__]
Founder 2  ₹ [__]     [_]%      [__]     ₹ [__]
Founder 3  ₹ [__]     [_]%      [__]     ₹ [__]

Salary:
- Annual: ₹ [_______________]
- Frequency: Monthly
- Reviews: [Annually/As per performance]
- Adjustment: [By consent/CEO decision]

Benefits:
- [ ] Health Insurance
- [ ] Provident Fund
- [ ] Other: [specify]

Bonus:
- Criteria: [specify]
- Determined by: [Board/CEO/Metrics]
- Distribution: [Quarterly/Annual]

7. DECISION-MAKING
Decision              Authority        Voting
Daily operations      Individual       Single
Hiring/Firing        [CEO/Board]      [Single/Unanimous]
Salaries >₹5L        [Board/All]      Unanimous
Major contracts      [CEO/Board]      CEO approval
Equity grants        [Board/Founders] [specify]
Fundraising          [Board/All]      Unanimous
Dissolution          [Board/All]      Unanimous

Board:
- Members: [Founders 1, 2, 3]
- Meetings: [Monthly/Quarterly]
- Decisions: [Majority/Unanimous]

Founder Meetings:
- Frequency: [Monthly/Quarterly]
- Notice: 5 business days
- Quorum: [50%+1/All]
- Decisions: [Unanimous/Majority]

8. INTELLECTUAL PROPERTY
IP Created During Work:
- Belongs to COMPANY (not founders)
- Includes: Code, designs, content, processes, patents, trademarks
- Founders must execute IP assignment documents

Founder's Pre-Existing IP:
- Founder retains ownership
- Grants exclusive license to company (royalty-free)
- Must be documented at formation

IP Created Post-Departure:
- Belongs to company if related to business
- Exception: Clearly unrelated IP

Disputes:
- Resolved through arbitration
- Company may buy out founder's IP at fair value

9. CONFIDENTIALITY
During Founder Status:
- No disclosure of confidential info
- Duration: [2-3 years] post-departure
- Covers: Business plans, technology, financial data, customers, strategy

Permitted Disclosures:
- [ ] Spouse/immediate family
- [ ] Legal advisor (attorney-client privilege)
- [ ] Accountant/auditor
- [ ] Required by law

Breach Consequences:
- Injunctive relief
- Monetary damages
- Potential equity forfeiture

10. FOUNDER DEPARTURE
Voluntary Resignation:
- Notice: [2 weeks/1 month/3 months]
- Vested equity: Retained
- Unvested: Forfeited

Termination for Cause:
- Grounds: Misconduct, conviction, breach, absence, fraud
- Process: Notice with cause, [___] days to cure
- All equity reverted
- Buy-back of vested: [specify]

No-Fault Termination:
- Removed by: [Board/Founder vote]
- Notice: [30/60 days]
- Vested: Retained
- Unvested: Forfeited
- Severance: [specify if any]

Death/Disability:
- Vested: Passes to estate/heirs
- Unvested: 100% acceleration
- Disability definition: [medical criteria]
- Estate has [___] days to sell back

11. BUY-BACK & SHARE REPURCHASE
Company Buy-Back:
- Option to buy shares upon departure
- Price: [Fair value/Cap table/Formula]
- Terms: [Lump sum/Installments]

Founder Buy-Back:
- Remaining founders may buy departing founder's shares
- Price: [Specify]
- Timeline: [___] days after notice

Drag-Along & Tag-Along:
- Drag-Along: If [X]% approve, all must sell
- Tag-Along: Founders participate in investor sales

12. DISPUTE RESOLUTION
Step 1 - Direct Discussion:
- Founders discuss directly
- Goal: Mutual resolution
- Document in writing

Step 2 - Mediation:
- Neutral mediator
- Costs shared equally
- Timeline: [___] days

Step 3 - Arbitration:
- Binding arbitration
- Single or three-panel arbitrator
- Governed by Arbitration Act, 1996
- Venue: [City]
- Award is final

Deadlock Resolution:
- Russian Roulette: Offer price X, other chooses buy or sell
- CEO Decision: CEO breaks tie
- Founder Vote: Third founder votes

13. FUNDING & CAPITAL RAISES
Future Funding:
- Founders may dilute through investor funding
- Current ownership: [specify]
- Max acceptable dilution: [___]%

Investor Rights:
- Board seat, liquidation preferences, anti-dilution
- Founder dilution: [specify calculation]
- Employee pool: [___]%

Pro-Rata Rights:
- Right to participate in future rounds
- Terms: [Same as investors/Specify]
- If not participating, dilution accepted

Valuation:
- Current: ₹ [_______________] (pre-money)
- Post-investment: [TBD]
- Disputes: [Mutually agreed expert/Arbitration]

14. CONFIDENTIALITY & NON-DISPARAGEMENT
Post-Departure:
- No negative public statements
- No disparagement of company, investors, founders
- Duration: [2-3 years]
- Violation: Lawsuit/Equity forfeiture

Permitted Statements:
- Factual employment history
- Required by law
- Private discussions

15. AMENDMENT
• May amend ONLY with written consent of all founders
• Effective from: [specified date]
• Copies distributed to all

SIGNATURES
Co-Founder 1:
Name: _________________________
Signature: _________________________
Date: _________________________

Co-Founder 2:
Name: _________________________
Signature: _________________________
Date: _________________________

Co-Founder 3 (if applicable):
Name: _________________________
Signature: _________________________
Date: _________________________`
  },
  {
    id: "template-partnership",
    title: "Partnership Deed",
    description: "Complete partnership deed with capital contribution, profit/loss sharing, roles, and dissolution terms",
    category: "legal",
    fileType: "docx",
    content: `PARTNERSHIP DEED

Date: [_______________]

BETWEEN:
[PARTNER 1 NAME], residing at [ADDRESS]
[PARTNER 2 NAME], residing at [ADDRESS]
[PARTNER 3 NAME] (if applicable), residing at [ADDRESS]

1. PARTNERSHIP DETAILS
Firm Name: [_______________]
Nature of Business: [_______________]
Principal Place: [_______________]
Registration Date: [_______________]

2. CAPITAL CONTRIBUTION
Partner Name    Amount      Payment Details    Ownership %
Partner 1       ₹ _____    [cash/assets]      _____ %
Partner 2       ₹ _____    [cash/assets]      _____ %
Partner 3       ₹ _____    [cash/assets]      _____ %
TOTAL           ₹ _____                       100%

Notes:
- Payment deadline: [_______________]
- No interest on capital
- Capital is partnership property

3. PROFIT & LOSS SHARING
Partner Name    Profit Share    Loss Share
Partner 1       _____ %        _____ %
Partner 2       _____ %        _____ %
Partner 3       _____ %        _____ %

Distribution Frequency: [quarterly/semi-annual/annual]
Distribution Date: [_______________]

4. ROLES & RESPONSIBILITIES
Partner    Position    Key Responsibilities
Partner 1  [Title]     [Duties]
Partner 2  [Title]     [Duties]
Partner 3  [Title]     [Duties]

Decision-Making:
- Routine Decisions: Any single partner
- Major Decisions (Unanimous Consent):
  - Admission of new partners
  - Change in business nature
  - Sale/purchase of assets
  - Borrowing beyond ₹ [_____]
  - Salary changes
  - Dissolution

5. DRAWING ACCOUNTS
Partner    Monthly Draw    Limit
Partner 1  ₹ _____        [terms]
Partner 2  ₹ _____        [terms]
Partner 3  ₹ _____        [terms]

• Excess drawings need approval
• Deducted from profit share at year-end
• Interest at [___]% if not adjusted

6. BANKING & FINANCIAL
Bank Account: [Bank Name], [Branch]
Account Number: [_______________]
Signatories: [Partner names]
Cheque Requirements: Signed by [1/2/all]

Financial Statements:
- Prepared by: [DATE]
- Audited by: [Auditor name]
- Books maintained at: [Location]
- Partners can inspect anytime

GST & Taxes:
- GST returns: [monthly/quarterly/annual]
- Income tax: Filed by [CA name]
- All compliance: Joint responsibility

7. ADMISSION OF NEW PARTNERS
Requirements:
- Unanimous consent of existing partners
- Written agreement
- Capital contribution
- Accept existing liabilities
- Agree to profit ratio

Capital:
- Goodwill: ₹ [_______________]
- Cash: ₹ [_______________]
- Assets: [_______________]

8. PARTNER RETIREMENT
Notice: [___] months written notice
Capital Refund: Within [___] months
Outstanding Dues: [___] installments
Profit Share: Included till retirement date

Settlement:
- Capital: ₹ [_______________]
- Profits (till date): ₹ [_______________]
- Reserves: [___]% of share
- Goodwill: [_______________]

9. EXPULSION
Grounds:
- Gross misconduct
- Repeated breach
- Unauthorized disclosure
- Insolvency
- Inability to contribute

Process:
- Requires [unanimous/majority] consent
- Written notice with reasons
- Partner gets [___] days to respond

Settlement:
- Capital: ₹ [_______________]
- Profits/losses: [calculated]
- Goodwill: [_______________]
- Within [___] months

10. DISSOLUTION
Grounds:
- Mutual agreement
- Death of partner
- Bankruptcy
- Breach of conditions
- Court order

Process:
- [___] days notice
- Liquidate assets
- Pay liabilities
- Distribute remaining per ratio
- Records maintained [___] years

11. NON-COMPETE & CONFIDENTIALITY
During Partnership:
- No competing business
- No disclosure of information
- No customer solicitation
- No independent supplier dealings

Post-Dissolution:
- Non-compete: [___] years
- Geographic restriction: [_______________]
- Confidentiality: Indefinite

12. DISPUTE RESOLUTION
Resolution Steps:
1. Discussion between partners
2. Mediation (costs shared equally)
3. Arbitration (binding and final)

Jurisdiction:
- Governed by laws of [State]
- Courts in [City]

SIGNATURES
Partner 1:
Name: _________________________
Address: _________________________
Signature: _________________________
Date: _________________________

Partner 2:
Name: _________________________
Address: _________________________
Signature: _________________________
Date: _________________________

Partner 3 (if applicable):
Name: _________________________
Address: _________________________
Signature: _________________________
Date: _________________________

Witnesses:
Witness 1: _________________________
Signature: _________________________
Date: _________________________

Witness 2: _________________________
Signature: _________________________
Date: _________________________`
  },
  {
    id: "template-employment",
    title: "Employment Contract",
    description: "Standard employment contract with position details, compensation, benefits, confidentiality, and termination terms",
    category: "hr",
    fileType: "docx",
    content: `EMPLOYMENT CONTRACT

Date: [_______________]

BETWEEN:
[COMPANY NAME], registered at [ADDRESS] ("Employer")

AND:
[EMPLOYEE NAME], residing at [ADDRESS] ("Employee")

1. POSITION & RESPONSIBILITIES
Job Title: [_______________]
Department: [_______________]
Reporting To: [_______________]
Location: [_______________]

Responsibilities:
- [List key duties]
- [Performance metrics]
- [Strategic objectives]

2. EMPLOYMENT TERMS
Employment Type: [ ] Full-time [ ] Part-time [ ] Contract
Probation Period: [___] months
Start Date: [_______________]
Status: At-will employment

3. COMPENSATION
Monthly Salary: ₹ [_______________]
Variable Bonus: ₹ [_______________]
Payment Frequency: Monthly on [date]
Payment Mode: Bank transfer

Benefits Include:
- [ ] Health Insurance
- [ ] Life Insurance
- [ ] Provident Fund (EPF)
- [ ] Gratuity
- [ ] Leave Travel Allowance
- [ ] Other: [specify]

4. WORK HOURS & LEAVE
Weekly Hours: 40-50 hours
Daily Timing: [_____] AM to [_____] PM
Lunch Break: [_____] minutes

Leave Entitlements (Per Year):
- Casual Leave: [___] days
- Sick Leave: [___] days
- Earned Leave: [___] days
- Paid Leave: [___] days
- National Holidays: As per notification

5. CONFIDENTIALITY & NON-COMPETE
Confidentiality Obligation:
- Duration: 2 years after termination
- Covers: Business strategies, financial data, user data, code, designs
- Applies to: Customer lists, pricing, technology, methods

Non-Compete Clause:
- Duration: 12 months after termination
- Geographic scope: [_______________]
- Exception: With written Company approval

Intellectual Property Assignment:
- All IP created during employment belongs to Company
- Employee shall execute IP assignment documents

6. GROUNDS FOR TERMINATION
Termination by Company (With Cause):
- Gross misconduct or breach of policies
- Repeated negligence or underperformance
- Unauthorized disclosure of confidential information
- Criminal conviction
- Dishonesty or fraud

Termination by Company (Without Cause):
- As per statutory requirements
- Severance pay: [specify]

Termination by Employee:
- Written notice of [___] days
- Continue working during notice period

7. NOTICE PERIOD & SETTLEMENT
Notice Period: [___] days

Final Settlement includes:
- Pending salary
- Pro-rata benefits
- Leave encashment
- Gratuity
- Full settlement within [___] days

8. CODE OF CONDUCT
Employee agrees to:
- Maintain professional behavior
- Follow Company's Code of Conduct
- Comply with all applicable laws
- Report violations
- Maintain workplace safety
- Respect diversity
- Maintain punctuality
- Protect Company assets

9. PERFORMANCE & PROBATION
Probation Period: [___] months

During Probation:
- Regular performance evaluation
- Company may terminate without notice
- May be extended by [___] months
- Completion depends on satisfactory performance

10. AMENDMENT & CHANGES
• Company may amend with [___] days written notice
• Changes communicated via email/handbook
• Continued employment implies acceptance
• Statutory compliance supersedes

SIGNATURES
For Company:
Company Name: _________________________
Authorized Signatory: _________________________
Signature: _________________________
Date: _________________________

For Employee:
Employee Name: _________________________
Signature: _________________________
Date: _________________________

Witness:
Witness Name: _________________________
Signature: _________________________
Date: _________________________`
  },
  {
    id: "template-nda",
    title: "Non-Disclosure Agreement (NDA)",
    description: "Comprehensive mutual NDA protecting confidential business information with clear obligations and remedies",
    category: "legal",
    fileType: "docx",
    content: `NON-DISCLOSURE AGREEMENT

Date: [_______________]

BETWEEN:
[COMPANY NAME], registered at [ADDRESS] ("Company")

AND:
[RECIPIENT NAME], residing at [ADDRESS] ("Recipient")

1. PURPOSE
The Parties wish to share confidential information relating to:
- Product development and innovation
- Business strategy and operations
- User data and analytics
- Financial information
- Technology and code
- Product designs
- Educational content
- Internal processes

2. DEFINITION OF CONFIDENTIAL INFORMATION
• Business plans and strategies
• User data and customer lists
• Financial data and projections
• Source code and algorithms
• Product designs and specifications
• Internal processes and documentation
• Any information marked as "Confidential"
• Trade secrets and intellectual property

3. EXCLUSIONS
Information is NOT confidential if it:
- Was already public at time of disclosure
- Becomes public without breach
- Was independently known to Recipient
- Rightfully received from third party
- Must be disclosed by law

4. OBLIGATIONS OF RECIPIENT
• Not disclose information to third parties without written consent
• Use information only for stated Purpose
• Protect information with reasonable care
• Limit access to employees who need-to-know
• Report immediately any unauthorized use
• Implement security measures

5. NO LICENSE GRANTED
This Agreement does NOT grant:
- Any license to Company's Intellectual Property
- Any ownership rights
- Rights to reproduce or modify
- Authorization to use beyond stated Purpose

6. TERM & DURATION
• Confidentiality obligations commence on signing date
• Obligations continue for 3 years
• Obligations survive termination of business relationship

7. RETURN OR DESTRUCTION
Upon request, Recipient shall:
- Return all Confidential Information, OR
- Permanently destroy all information
- Provide written certification within 15 days
- Retain only one copy if required by law

8. REMEDIES FOR BREACH
Company entitled to:
- Injunctive Relief
- Monetary Damages
- Termination of collaboration
- Recovery of legal costs

9. GOVERNING LAW
• Governed by laws of India
• Jurisdiction: Delhi courts
• Disputes resolved through arbitration or litigation

SIGNATURES
Company:
Company Name: _________________________
Representative: _________________________
Signature: _________________________
Date: _________________________

Recipient:
Name: _________________________
Signature: _________________________
Date: _________________________`
  },
  {
    id: "template-checklists",
    title: "Legal Document Checklists",
    description: "Comprehensive checklists for reviewing and signing various legal documents including NDAs, employment contracts, partnerships, and co-founder agreements",
    category: "legal",
    fileType: "docx",
    content: `LEGAL DOCUMENT CHECKLISTS

Before Signing Any Document
☐ Read entire document
☐ Understand all sections
☐ Fill ALL blanks completely
☐ No spelling errors
☐ All names and details correct
☐ Dates are clear
☐ All terms understood
☐ Consult lawyer (recommended)
☐ Witnesses present
☐ All signatures clear
☐ Make copies
☐ Store safely

For NDA
☐ Clear Purpose
☐ Confidential Info listed
☐ 3-year term specified
☐ Remedies included
☐ Both parties signed

For Employment
☐ Title and duties clear
☐ Salary definite
☐ Leave specified
☐ Confidentiality included
☐ Non-compete included
☐ Termination grounds listed
☐ Both signed

For Partnership
☐ All partner names
☐ Capital amounts specified
☐ Profit ratio decided
☐ Roles clear
☐ Decision authority set
☐ All partners signed

For Co-Founders
☐ All founder names
☐ Equity % decided
☐ Vesting schedule clear
☐ Roles listed
☐ Time commitment set
☐ Compensation decided
☐ Exit provisions noted
☐ All founders signed

DOCUMENT REVIEW TIPS

1. Review Timing
- Never sign under pressure
- Take 24-48 hours to review
- Read when well-rested and focused
- Review multiple times if complex

2. Understanding Terms
- Look up unfamiliar legal terms
- Ask questions about unclear sections
- Get explanations in writing
- Confirm your interpretation matches intent

3. Professional Review
- Consult with attorney for major agreements
- Get accountant input on financial terms
- Industry expert review for technical terms
- HR professional for employment matters

4. Common Red Flags
- Blank spaces or incomplete sections
- Vague or ambiguous language
- One-sided terms favoring other party
- Unreasonable restrictions or obligations
- Missing termination or exit clauses
- Excessive liability or penalties

5. Before Signing
- Verify all parties are correct
- Confirm all attachments are included
- Check dates are current and correct
- Ensure witnesses are present if required
- Make copies for all parties
- Store original safely

6. After Signing
- Keep original in secure location
- Create digital backup copy
- Calendar important dates (renewals, deadlines)
- Share copy with relevant parties
- Review periodically for compliance
- Update if circumstances change

SPECIFIC DOCUMENT GUIDELINES

Co-Founders Agreement:
- Define equity split clearly
- Include vesting schedule
- Specify decision-making authority
- Address IP ownership
- Plan for founder departure
- Include dispute resolution

Partnership Deed:
- Document capital contributions
- Clarify profit/loss sharing
- Define each partner's role
- Establish decision-making process
- Plan for admission/exit of partners
- Address dissolution terms

Employment Contract:
- Verify position and responsibilities
- Confirm compensation and benefits
- Understand termination conditions
- Review non-compete terms
- Check IP assignment clauses
- Clarify notice period

Non-Disclosure Agreement:
- Define what is confidential
- Understand duration of obligations
- Know permitted disclosures
- Clarify return/destruction terms
- Understand breach consequences
- Check applicable law

CONTACT INFORMATION FOR REVIEW

Legal Review:
Attorney Name: _________________________
Phone: _________________________
Email: _________________________

Financial Review:
Accountant Name: _________________________
Phone: _________________________
Email: _________________________

HR Review:
HR Consultant: _________________________
Phone: _________________________
Email: _________________________

Emergency Contacts:
Arbitrator/Mediator: _________________________
Phone: _________________________
Email: _________________________`
  }
];

// EdTech-specific templates - Only shown to EdTech startups
const EDTECH_TEMPLATES: Template[] = [
  {
    id: "template-edtech-tos",
    title: "Terms of Service (EdTech)",
    description: "Comprehensive Terms of Service specifically designed for EdTech platforms, covering user eligibility, platform usage, payments, content ownership, and educational service provisions",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `TERMS OF SERVICE (TOS)

Last Updated: [Date]

1. Introduction
Welcome to [Company Name]. By creating an account or using our platform, you agree to these Terms of Service.

2. Eligibility
Users under 18 must use the platform under parental or guardian supervision.

3. Account Responsibilities
Provide accurate information.
Keep credentials confidential.
You are responsible for all activity under your account.

4. Use of the Platform
You agree not to:
Attempt to reverse-engineer the platform.
Upload harmful, abusive, or unlawful content.
Disrupt classes, assessments, or learning features.

5. Payments
All fees are listed on the website or app.
Non-payment may result in suspended access.
Refunds follow our Refund Policy.

6. Content Ownership
We own all platform materials unless stated otherwise. Instructors grant us rights to host their content.

7. Termination
We may suspend or terminate accounts violating these terms.

8. Limitation of Liability
The platform is provided "as is." We are not liable for academic outcomes or loss of data.

9. Governing Law
These terms are governed by the laws of India.`
  },
  {
    id: "template-edtech-privacy",
    title: "Privacy Policy (EdTech)",
    description: "EdTech-specific privacy policy addressing student data protection, learning analytics, parental consent requirements, and COPPA/FERPA compliance considerations",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `PRIVACY POLICY

Last Updated: [Date]

1. Data We Collect
Personal information: name, email, phone.
Learning data: progress, assessments.
Device and usage data.

2. How We Use Data
Improve learning recommendations.
Provide customer support.
Comply with legal obligations.

3. Cookies
We use cookies for analytics and personalisation.

4. Children's Data
Users under 18 require parental consent. We do not knowingly collect data from children without supervision.

5. Third-Party Sharing
We only share data with:
Payment processors.
Cloud hosting partners.
Analytics providers.
All partners must meet our data protection standards.

6. Data Deletion
You may request deletion by emailing [email].

7. Security
We follow industry-standard security safeguards.`
  },
  {
    id: "template-edtech-child-safety",
    title: "Child Safety and Protection Policy",
    description: "Comprehensive child safety policy for EdTech platforms covering prohibited behavior, reporting mechanisms, safety measures, instructor responsibilities, and parental involvement",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `CHILD SAFETY AND PROTECTION POLICY

1. Purpose
This policy protects all minors using the platform. It outlines behavior standards, monitoring measures, reporting systems, and response procedures. The goal is to create a safe learning environment where students can participate without fear of exploitation, bullying, or exposure to harmful content.

2. Scope
This policy applies to:
All students under 18
Parents and guardians
Instructors and staff
Vendors and third-party service providers
Any user interacting with minors on the platform

3. Prohibited Behavior
The following actions are strictly prohibited:
Sharing personal contact information such as phone numbers, addresses, social media IDs.
Grooming behavior, inappropriate communication or attempts to build secret relationships with minors.
Harassment, bullying, threats, discrimination, or demeaning language.
Sharing or requesting inappropriate images, videos, or documents.
Attempting to move conversations outside the platform.
Any form of abuse, exploitation, or manipulation.

4. Reporting Mechanisms
Users may report any suspicious or concerning behavior through:
In-app reporting tools
Email at [email]
A dedicated safety helpline number (if available)
School or institutional escalation (for integrated accounts)
Reports may be filed anonymously.

5. Review and Response Process
All reports are acknowledged within 24 hours.
Investigation begins within 48 hours.
The Safety Team may temporarily restrict accounts during review.
If a violation is confirmed, actions may include warnings, suspensions, permanent bans, or reporting to relevant authorities.
Parents or guardians may be notified if the relevant user is a minor.

6. Safety Measures
To create a secure environment, the platform implements:
Automated content filters that detect sensitive or harmful language.
Manual moderation of classes, chats, and discussion boards.
Restricted messaging features for minors.
Verification layers for instructors and staff.
Regular audits of communication logs.
Flagging systems for unusual behavior patterns.

7. Instructor Responsibilities
All instructors must:
Maintain professional communication with students.
Use only approved communication channels.
Avoid 1-on-1 unsupervised communication unless explicitly authorized.
Report suspicious student behavior immediately.

8. Parent and Guardian Responsibilities
Parents agree to:
Supervise their child's use of the platform.
Review notifications and activity logs.
Report concerns promptly.

9. Data Protection for Minors
Minimal data is collected from minors.
Sensitive data is encrypted.
No behavioral data is sold or used for advertising.

10. Policy Violations
Any individual violating this policy may face:
Permanent account termination
Legal action
Notification to law enforcement`
  },
  {
    id: "template-edtech-parental-consent",
    title: "Minor Consent / Parental Consent Form",
    description: "Parental consent form template for EdTech platforms to obtain guardian approval for minors using educational services and data collection",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `PARENTAL CONSENT FORM

Minor Consent / Parental Consent Form

I, [Parent/Guardian Name], consent to my child [Child Name] using the educational services provided by [Company]. I acknowledge the platform will collect learning and usage data for educational purposes.

Signature: ______________________
Date: ______________________`
  },
  {
    id: "template-edtech-instructor",
    title: "Instructor / Teacher Agreement",
    description: "Comprehensive instructor agreement for EdTech platforms covering engagement terms, compensation, content rights, confidentiality, and termination provisions",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `INSTRUCTOR / TEACHER AGREEMENT

1. Engagement
The Instructor agrees to provide educational content and/or conduct live or pre-recorded instructional sessions for [Company]. This includes, but is not limited to:
Developing and updating course materials (lesson plans, quizzes, assignments).
Conducting scheduled online classes, workshops, or one-on-one sessions.
Responding to student inquiries and providing timely feedback on assignments and assessments.
Adhering to the pedagogical standards and quality requirements set by the Company.
Maintaining a professional and safe learning environment, fully complying with the Child Safety and Protection Policy.

2. Compensation
Payment Terms: Compensation for services rendered, including the rate of pay (e.g., hourly, per course, or fixed salary) and the payment schedule (e.g., monthly), shall be exclusively governed by the terms outlined in Schedule A attached hereto and incorporated by reference.
Expenses: The Company is not responsible for any expenses incurred by the Instructor unless explicitly agreed upon in writing.
Taxes: The Instructor acknowledges that they are an independent contractor (or employee, as defined in Schedule A) and is solely responsible for all income tax, social security, and other statutory deductions related to their compensation.

3. Content Rights
License Grant: The Instructor hereby grants to the Company a worldwide, perpetual, irrevocable, non-exclusive, royalty-free, sublicensable, and transferable license to host, distribute, display, promote, modify (for technical purposes), and commercially exploit all content, materials, and intellectual property submitted by the Instructor ("Submitted Content") on the Company's platform and through any distribution channels.
Ownership: The Instructor retains ownership of the original intellectual property in the Submitted Content, but acknowledges the Company's permanent right to use it as described above. All intellectual property created by the Instructor specifically at the Company's direction and for its exclusive use shall be considered a "work-for-hire" and shall be the sole property of the Company.

4. Confidentiality
Obligation: The Instructor agrees not to disclose, directly or indirectly, any internal company information, including but not limited to business plans, financial data, technology, source code, employee data, marketing strategies, or non-public user data, to any third party during or after the term of this Agreement.
Duration: This confidentiality obligation shall survive the termination of this Agreement for a period of [3] years, except for trade secrets, which shall remain confidential indefinitely.

5. Termination
Termination with Notice: Either party (The Company or the Instructor) may terminate this Agreement for any reason by providing 14 days' written notice to the other party.
Termination for Cause (Immediate): The Company may terminate this Agreement immediately upon written notice if the Instructor:
Commits a material breach of this Agreement (e.g., violation of the Child Safety Policy or breach of Confidentiality).
Engages in gross misconduct, fraud, or acts detrimental to the Company's reputation.
Fails to cure a remediable performance deficiency within 7 days of receiving written notice.
Post-Termination: Upon termination, the Instructor must immediately cease all teaching activities for the Company and promptly return all Company property, materials, and confidential information. The Company shall pay the Instructor all earned compensation up to the effective date of termination.`
  },
  {
    id: "template-edtech-content-licensing",
    title: "Content Licensing Agreement",
    description: "Content licensing agreement template for EdTech platforms to establish terms for educational content distribution, royalties, and content ownership",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `CONTENT LICENSING AGREEMENT

1. Licensed Content
Content owner grants non-exclusive rights to distribute educational content.

2. Duration
License valid for the term listed in Schedule A.

3. Royalties
Royalties will be paid monthly as per agreed percentages.

4. Content Removal
Owner may request removal with 30 days' notice.`
  },
  {
    id: "template-edtech-school-mou",
    title: "School / Institution MoU",
    description: "Memorandum of Understanding template for EdTech platforms partnering with schools and educational institutions, covering roles, responsibilities, data sharing, and pricing",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `SCHOOL / INSTITUTION MoU

1. Objective
Partnership to provide digital learning solutions to students of [School Name].

2. Roles
Company: onboarding, tech support, training.
School: provide access, ensure student participation.

3. Data Sharing
Only necessary data will be shared and protected.

4. Pricing
Fees listed in Schedule A.

5. Validity
MoU valid for 12 months.`
  },
  {
    id: "template-edtech-dpa",
    title: "Data Processing Agreement (DPA)",
    description: "Data Processing Agreement for EdTech platforms defining how third-party services process student and instructor data, with breach protocols and compliance requirements",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `DATA PROCESSING AGREEMENT (DPA)

1. Purpose
Defines how third-party services process student and instructor data.

2. Responsibilities
Processor implements technical safeguards.
Company remains data controller.

3. Breach Protocol
Processor must notify the Company within 24 hours.`
  },
  {
    id: "template-edtech-refund",
    title: "Refund & Cancellation Policy (EdTech)",
    description: "EdTech-specific refund and cancellation policy covering course purchases, live class batches, downloaded materials, and certification refund eligibility",
    category: "legal",
    fileType: "docx",
    industry: "edtech",
    content: `REFUND & CANCELLATION POLICY

1. Refund Eligibility
Refunds allowed within 7 days of purchase.
Live class batches refundable only before first class.

2. Non-Refundable Items
Downloaded materials.
Certifications.

3. Process
Users must email [email]. Refunds processed in 7 working days.`
  }
];

export default function TemplatesPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [userIndustry, setUserIndustry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>(STANDARD_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(STANDARD_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch user's startup industry
  useEffect(() => {
    async function fetchUserIndustry() {
      if (sessionPending || !session?.user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/startups", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const startups = await response.json();
          if (startups.length > 0) {
            const industry = startups[0].industry;
            setUserIndustry(industry);
            
            // Determine which templates to include based on industry
            let allTemplates = [...STANDARD_TEMPLATES];
            
            if (industry?.toLowerCase().includes('edtech') || industry?.toLowerCase().includes('education')) {
              allTemplates = [...allTemplates, ...EDTECH_TEMPLATES];
            }
            
            if (industry?.toLowerCase().includes('agri')) {
              // Add AgriTech-specific templates
              const agriTechTemplates: Template[] = [
                {
                  id: 'agritech-farmer-agreement',
                  title: 'Farmer Agreement Template',
                  description: 'Comprehensive agreement template for onboarding farmers to AgriTech platforms. Covers services, obligations, data rights, payments, liability, and termination terms.',
                  category: 'legal',
                  fileType: 'txt',
                  industry: 'agritech',
                  content: `FARMER AGREEMENT

This Farmer Agreement ("Agreement") is made between:
[Company Name], a company registered under the laws of India, having its registered office at [Address], hereinafter referred to as the "Company".
[Farmer Name], residing at [Address], holding Farmer ID / Aadhaar No. [Number], hereinafter referred to as the "Farmer".

Both parties agree as follows:

1. PURPOSE
The purpose of this Agreement is to provide the Farmer access to agricultural advisory, input marketplace services, soil analysis, farm digitisation tools, and procurement or buyback support.

2. SERVICES PROVIDED BY THE COMPANY
The Company agrees to provide:
• Crop advisory based on soil data, satellite insights, and agronomy models.
• Weather alerts, disease/pest warnings, and irrigation recommendations.
• Access to certified agricultural inputs (seeds, fertilizers, pesticides).
• Soil testing integration and analysis.
• Market linkage, including aggregation, grading, and procurement support.
• Digital farm record services.

3. OBLIGATIONS OF THE FARMER
The Farmer agrees to:
• Provide accurate farm details (acreage, crop type, sowing dates, irrigation method).
• Use inputs as per safety instructions.
• Allow field inspections by Company/FPO teams when required.
• Maintain honesty in reporting production and quality.
• Not misuse the platform for fraudulent orders or resale.

4. DATA RIGHTS & PRIVACY
• Farmer owns all raw farm-level data.
• The Company owns processed data such as analytics, insights, and models.
• The Farmer permits the Company to use anonymised data for research, training models, and platform improvement.
• Data handling will comply with India's DPDP Act.

5. PAYMENTS & SETTLEMENT
• Payments for all inputs must be made through UPI, NEFT, or in-app options.
• In procurement models, payment will be made after quality assessment.
• Payouts will be transferred to the Farmer's registered bank account.

6. LIABILITY
The Company is not responsible for:
• Crop losses due to weather, irrigation failure, or pests.
• Incorrect application of inputs.
• Government policy changes affecting prices.

7. TERM & TERMINATION
• The Agreement remains valid until either party terminates it.
• Either party may terminate with 7 days' written notice.
• Outstanding dues must be settled before termination.

8. GOVERNING LAW
This Agreement is governed by the laws of India. Jurisdiction lies with courts in [City].

SIGNATURES

Farmer: ____________________________
Company: ___________________________
Date: ______________________________`
                },
                {
                  id: 'agritech-vendor-agreement',
                  title: 'Vendor Agreement for Input Suppliers',
                  description: 'Agreement for agricultural input suppliers (seeds, fertilizers, pesticides, equipment) covering product standards, compliance, delivery terms, pricing, returns, and liability.',
                  category: 'legal',
                  fileType: 'txt',
                  industry: 'agritech',
                  content: `VENDOR AGREEMENT FOR INPUT SUPPLIERS

This Vendor Agreement ("Agreement") is executed between:
[Company Name], hereinafter "Company".
[Vendor Name], having GST No. [Number], hereinafter "Vendor".

1. PURPOSE
This Agreement governs the supply of agricultural inputs (seeds, fertilizers, pesticides, equipment) to the Company for resale to farmers.

2. PRODUCT STANDARDS & COMPLIANCE
The Vendor must ensure:
• Seeds comply with Seed Act 1966 & Seed Rules 1968.
• Fertilizers comply with the FCO 1985.
• Pesticides comply with Insecticides Act 1968 & CIBRC norms.
• All products are genuine, not expired, and properly labeled.
• Batch numbers, manufacturing dates, and expiry dates must be visible.

3. SUPPLY & DELIVERY TERMS
• Delivery time must follow agreed SLA (3–7 days).
• Wrong or damaged shipments must be replaced within 48 hours.
• Vendor must maintain adequate stock levels.
• Company may conduct surprise quality audits.

4. PRICING & INVOICING
• Vendor must provide updated price lists 7 days before changes.
• All invoices must be GST compliant.
• Special discounts for bulk orders must be mutually agreed.

5. RETURNS & REPLACEMENTS
The Company may return or request replacement for:
• Defective or expired items
• Incorrect product deliveries
• Batches with repeated farmer complaints

6. LIABILITY
The Vendor is liable for:
• Losses caused by substandard or counterfeit inputs.
• Legal issues arising from regulatory non-compliance.
• Crop loss claims proven to be caused by defective inputs.

7. PAYMENT TERMS
• Payment cycle: 15–45 days depending on product category.
• Payments for disputed batches may be withheld.
• Penalties apply for SLA violations.

8. CONFIDENTIALITY
Vendor must keep all business, pricing, and operational details confidential.

9. TERMINATION
Either party may terminate with 10 days' notice.

SIGNATURES

Vendor: ____________________________
Company: ___________________________
Date: ______________________________`
                },
                {
                  id: 'agritech-fpo-mou',
                  title: 'FPO Partnership MoU',
                  description: 'Memorandum of Understanding for partnerships with Farmer Producer Organizations. Covers collaboration objectives, roles, data sharing, financial terms, monitoring, and legal framework.',
                  category: 'legal',
                  fileType: 'txt',
                  industry: 'agritech',
                  content: `FPO PARTNERSHIP MoU

This Memorandum of Understanding ("MoU") is entered into by:
[Company Name], hereinafter "Company"
[FPO Name], Registration No. [Number], hereinafter "FPO"

1. OBJECTIVE
To collaborate for improving access to inputs, advisory, procurement, digital training, and market linkage for FPO members.

2. ROLES & RESPONSIBILITIES

Company Responsibilities:
• Onboard FPO and members onto the digital platform.
• Provide advisory and weather alerts.
• Provide access to input marketplace.
• Facilitate market linkage with buyers/processors.
• Conduct training sessions for FPO staff.
• Assist in quality grading and aggregation.

FPO Responsibilities:
• Share verified member data.
• Coordinate training and onboarding activities.
• Provide storage/warehouse support for procurement.
• Facilitate produce aggregation and quality checks.
• Maintain transparency in procurement and payouts.

3. DATA SHARING & PRIVACY
• Only essential data will be shared between parties.
• All data handling will follow DPDP Act guidelines.
• Both parties agree to protect farmer information.

4. FINANCIAL TERMS
• Commission or margin structure outlined in Schedule A.
• Discounts or incentives may be provided for bulk purchases.

5. MONITORING & REPORTING
• Monthly performance reviews.
• Quarterly dashboards for procurement, advisory usage, and training.
• Dispute resolution through a joint committee.

6. TERM & TERMINATION
• MoU validity: 12 months.
• Either party may terminate with 15 days' written notice.
• All dues must be settled before termination.

7. LEGAL FRAMEWORK
• Governed by Indian law.
• Jurisdiction: Courts of [City].

SIGNATURES

FPO: ____________________________
Company: ___________________________
Date: ______________________________`
                }
              ];
              
              allTemplates = [...allTemplates, ...agriTechTemplates];
            }
            
            setAvailableTemplates(allTemplates);
            setFilteredTemplates(allTemplates);
          }
        }
      } catch (error) {
        console.error('Error fetching startup:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserIndustry();
  }, [session, sessionPending]);

  // Update filters when search or category changes
  useEffect(() => {
    let filtered = [...availableTemplates];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, categoryFilter, availableTemplates]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        </main>
      </div>
    );
  }

  const hasEdTechTemplates = userIndustry?.toLowerCase().includes('edtech') || userIndustry?.toLowerCase().includes('education');
  const hasAgriTechTemplates = userIndustry?.toLowerCase().includes('agri');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Template Library</h1>
          <p className="text-lg text-gray-600">
            Ready-to-use legal documents and templates for your startup journey.
            {hasEdTechTemplates && (
              <span className="ml-2 inline-block rounded-md bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                ✨ Special EdTech templates are now available for your startup
              </span>
            )}
            {hasAgriTechTemplates && (
              <span className="ml-2 inline-block rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                ✨ Special AgriTech templates are now available for your startup
              </span>
            )}
          </p>
        </div>

        {/* Search & Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="hr">HR & Employment</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>📄 Note:</strong> These are sample templates for demonstration purposes. 
              Always have legal documents reviewed by qualified professionals before use. Templates 
              are downloaded as PDF files.
            </p>
          </CardContent>
        </Card>

        {/* Template Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                No templates match your search. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}