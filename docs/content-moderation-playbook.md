# Content Moderation Playbook

**Project:** Gram Vikash Foundation community module  
**Status:** Operational draft — approve with the designated Grievance Officer and safeguarding lead before launch  
**Audience:** Sunil, trusted volunteers, moderators, and support staff  
**Sources:** [`PRD.md`](../PRD.md) and [`security-and-privacy.md`](security-and-privacy.md) [1]

> **Working draft — review before relying on it.** This document provides operational guidance, not formal legal advice. Confirm the foundation’s intermediary classification, applicable IT Rules obligations, complaint timelines, child-protection contacts, and final notices with qualified Indian counsel before enabling user-generated content.

## 1. Moderation objectives

Moderation exists to keep the community useful, respectful, and safe while protecting children and vulnerable families. It is not a mechanism for suppressing disagreement about village issues. Moderators should enforce published rules consistently, record reasons, protect reporter privacy, and escalate safety or legal concerns rather than trying to investigate them personally.

The PRD identifies child-safety, harassment, defamation in vote-related debates, spam, malware, and real-time chat as high-risk areas. It recommends starting with public group chat rather than private direct messages so content remains visible to moderators. [1]

## 2. What is reviewed before publishing versus after

| Content | Default review state | Rule |
|---|---|---|
| Image/video/PDF upload | `under_review` before public URL | Validate type/size, scan for malware, review child/vulnerable-family content, then publish or reject |
| Post containing a child or coaching activity | Pre-publish review | Require documented guardian consent; prefer group/classroom framing; no identifying caption |
| Kanyadan story, image, or case detail | Pre-publish review | Default to aggregate/anonymized content; case-level naming requires written consent and safety review |
| Ordinary text post | Post-publish with fast reporting | Rate limit, automated basic checks if available, visible report button, remove when rule is breached |
| Comment | Post-publish with fast reporting | Remove harassment, threats, doxxing, hate, or identifying minor information; retain action log |
| Public group chat message | Post-publish with active monitoring | No private DMs in MVP; moderators can remove, suspend, and escalate; rate-limit floods |
| Poll proposal | Post-publish with proposal moderation | Reject spam, personal accusations, discriminatory proposals, and coordinated manipulation |
| Official vote issue | Admin approval before activation | Publish title, options, dates, and rules; after activation, do not silently alter ballot semantics |

A file that fails malware or type validation does not enter the moderator’s normal content queue; it remains quarantined or is rejected. A moderator must not approve content solely because a user claims it is harmless.

## 3. Content that must be removed or restricted

Remove or restrict the following examples, with the reason recorded in the moderation action:

1. A child’s full name, school, identifiable photograph, and family financial situation in one post or caption.
2. A classroom image without a documented guardian-consent record where the child is identifiable.
3. A kanyadan post naming a bride or family, showing a face, and describing the sanctioned amount without explicit written consent and safety review.
4. A phone number, home address, Aadhaar detail, identity document, or private contact information posted about another person.
5. Threats, stalking, sexual content involving a minor, instructions to meet a child privately, or content suggesting immediate danger.
6. Harassment, targeted abuse, caste/religion/gender slurs, or repeated unwanted contact.
7. Defamatory accusations naming a person in a vote debate without a safe, verified process for handling the complaint; move the issue to a grievance channel instead.
8. Malware, executable files, hidden scripts, disguised files, copyright-infringing uploads, or suspicious links.
9. Repeated commercial promotion, referral spam, fake fundraising, impersonation, bot-generated floods, or coordinated duplicate poll proposals.
10. Attempts to reveal individual votes, pressure members to disclose a secret ballot, or manipulate vote eligibility.
11. Content that encourages violence, unlawful activity, or retaliation against a family, donor, beneficiary, admin, or volunteer.
12. False claims presented as official foundation decisions, financial totals, or payment confirmations.

When content is borderline but does not create immediate risk, prefer a request for clarification or edit over removal. Do not edit a user’s meaning without permission; hide or restrict the item and ask the author to correct it.

## 4. Report → review → action workflow

### Step 1: Receive and acknowledge

A member uses the report button with a reason. The system creates a `Report` with target type, target ID, reporter ID, reason, timestamp, and `open` status. The reporter sees a neutral acknowledgement such as “Your report was received. Do not share additional private information in public chat.” The reported user does not see the reporter’s identity.

### Step 2: Triage

A moderator checks the queue at least twice daily during the pilot and actively monitors group chat during expected usage hours. Triage categories are:

| Priority | Examples | Internal target |
|---|---|---:|
| P0 urgent safety | Suspected child sexual abuse/exploitation, immediate threat, doxxing that creates imminent risk | Restrict immediately; notify safeguarding lead at once |
| P1 high risk | Identifiable minor without consent, credible threat, severe harassment, fraud, private document exposure | Acknowledge/restrict within 4 hours |
| P2 standard | Spam, repeated abuse, non-urgent privacy breach, inappropriate proposal | Review within 24 hours |
| P3 low risk | Off-topic, duplicate, minor tone dispute | Review within 48 hours |

These are internal service targets, not a statement of statutory timelines. The final grievance notice must use the legally reviewed timelines applicable to the platform. The current IT Rules source requires due diligence and a published grievance mechanism for covered intermediaries; applicability and current obligations must be confirmed for this foundation. [2]

### Step 3: Preserve minimum evidence

Record the target, safe internal ID, report reason, timestamps, moderation actor, and action. Do not copy child images or sensitive case details into spreadsheets, chat, or email. Preserve only what the safeguarding/legal owner requires and restrict access to the queue.

### Step 4: Choose an action

The moderator may dismiss a clearly invalid report, request an edit, hide/remove content, suspend an account, lock a thread, or escalate. A removal reason must be specific enough for internal consistency but must not reveal a reporter or confidential safeguarding detail. A user may appeal through the published grievance channel.

### Step 5: Communicate

Send the reporter a status update when policy permits. Send the author a concise decision notice unless doing so would create a safety or investigation risk. Never disclose private case facts, the reporter’s identity, or confidential evidence.

### Step 6: Close and audit

Set the report to `resolved` or `dismissed`, record the resolution notes, actor, and time, and link the moderation audit event. If the content was removed, confirm that its public URL is revoked or private. If the issue involved a payment claim or official vote, notify the responsible admin rather than making an operational promise in the community thread.

## 5. Grievance Officer checklist

The founder should designate a named Grievance Officer before community posting/chat goes live. The site should publish a dedicated contact channel, response expectations, community guidelines, privacy notice, and appeal path in English and the locally appropriate language. The Officer owns intake, acknowledgement, routing, resolution tracking, and periodic reporting; the Officer does not replace a child-protection professional or law-enforcement contact.

| Checklist item | Owner | Evidence |
|---|---|---|
| Name and contact channel published | Founder/Grievance Officer | Public grievance page |
| User agreement, privacy policy, and community rules published | Founder + counsel | Versioned pages and effective date |
| Report form works for posts, comments, chat, and proposals | Engineering | Integration test and pilot report |
| Complaint IDs and timestamps generated | Engineering | Admin queue/audit record |
| Acknowledgement and resolution targets documented | Grievance Officer + counsel | Internal SOP and public notice |
| Moderator roster and backup contact assigned | Founder | Private roster with coverage hours |
| Child-safety escalation contacts verified | Safeguarding lead | Restricted contact sheet, last-verified date |
| Appeals and restoration process documented | Grievance Officer | Decision template and audit example |
| Periodic moderation metrics reviewed | Grievance Officer | Monthly report: reports, removals, appeals, unresolved cases |
| Rule changes versioned and announced | Founder/Officer | Changelog and notice archive |

The MeitY-published IT Rules define a Grievance Officer and include intermediary due-diligence and grievance-redressal provisions; this checklist is an implementation aid, not a conclusion that every provision applies identically to this foundation. Obtain a legal applicability review before launch. [2]

## 6. Child-safety escalation

If a moderator sees suspected abuse, exploitation, an immediate threat, an identifying minor disclosure, or a request to contact a child privately:

1. Restrict the content and account immediately where necessary to reduce further exposure. Do not announce the reason publicly.
2. Notify the designated safeguarding lead and Grievance Officer using the restricted escalation channel.
3. Preserve only the minimum safe metadata and evidence needed for professional/authority review. Do not download, forward, or duplicate illegal child-abuse imagery.
4. Follow the foundation’s approved escalation to qualified child-protection professionals, local authorities, emergency services, or the appropriate child-protection mechanism. The moderator should not decide legal reporting requirements alone.
5. Do not contact the alleged perpetrator, interrogate the child, promise confidentiality that cannot be kept, or conduct an independent investigation.
6. Record the action, time, people notified, and next owner in the restricted incident log.
7. Keep the content removed or access-restricted while the safeguarding/legal owner decides the next step.

If someone may be in immediate danger, prioritize emergency help through the locally applicable emergency or child-protection channel. Moderators should use the approved contact sheet rather than searching for a public number during a crisis.

## 7. Account actions and proportionality

| Action | Appropriate when | User communication |
|---|---|---|
| Reminder/request edit | Minor, correctable rule issue | Explain the rule and requested change |
| Content restriction | Privacy, safety, harassment, or moderation concern | State that content is unavailable while reviewed |
| Temporary suspension | Repeated abuse, spam, threats, or evasion | State duration, rule, and appeal channel |
| Permanent suspension | Serious/repeated harm, impersonation, fraud, or safety threat | State decision without exposing evidence or reporter |
| Thread/channel lock | Rapid escalation, pile-on, or unsafe debate | Explain that discussion is paused for safety |
| Restoration | Successful appeal or mistaken removal | Record reason and notify affected user |

Actions are applied to behavior, not viewpoint. Financial transparency does not authorize a user to publish another person’s private information or unverified allegations.

## 8. Templates

### Warning message

> Hello [name]. Your post/message was flagged because it may conflict with our community rule on [rule]. Please [specific correction] by [time/date] or do not repost the material. Do not share a child’s name, image, phone number, address, or family financial details without appropriate consent. If you believe this is a mistake, contact [grievance channel].

### Content-removal notice

> Hello [name]. We removed or restricted your [post/comment/message] because it violated [community rule]. The action was taken on [date/time]. We have not shared your private information publicly. You may appeal through [grievance channel] with the reference [case ID]. Please do not repost the same content while the review is open.

### Community-guidelines summary for the site

> Be respectful and discuss village issues without harassment, threats, caste/religion/gender abuse, or personal attacks. Do not publish another person’s phone number, address, identity document, or private family details. Do not post a child’s identifying name/photo or a kanyadan family’s identity without documented consent. Upload only material you have the right to share. Use the report button for safety, privacy, spam, or impersonation concerns. Official votes show aggregate results; do not pressure anyone to reveal an individual ballot. Repeated or serious violations may lead to content removal or account suspension. For grievances, contact [Grievance Officer name/contact].

## 9. Moderator self-care and operational hygiene

Moderators should work in pairs for severe safeguarding matters where feasible, avoid saving sensitive content to personal devices, use foundation accounts rather than personal chat for casework, and take breaks after distressing material. Access to reports should be removed when a volunteer leaves. Monthly review should measure response times, repeat offenders, false reports, child-safety escalations, appeals, and unresolved cases without publishing sensitive narratives.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://www.meity.gov.in/static/uploads/2026/02/550681ab908f8afb135b0ad42816a1c9.pdf "Ministry of Electronics and Information Technology — Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, updated 10 February 2026"
