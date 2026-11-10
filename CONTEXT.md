# Portfolio

The portfolio presents Luigi's work and converts relevant visitors into professional opportunities.

## Language

**Prospective Client**:
A non-technical visitor considering Luigi for a Custom Website or Custom Business Tool. The homepage's primary audience.
_Avoid_: Lead, customer, user

**Primary Client**:
An independent professional or owner-led small business seeking a serious Custom Website or Custom Business Tool. This audience guides emphasis without excluding other Prospective Clients.
_Avoid_: Ideal customer profile, target customer

**Hiring Visitor**:
A recruiter or employer evaluating Luigi for employment. A secondary audience while client work is the homepage priority.
_Avoid_: Job lead, recruiter

**Default Experience**:
The balanced portfolio shown when a visitor reaches `girke.dev` without a valid Audience Signal or Saved Selection. It introduces software work and client services without privileging either journey.
_Avoid_: Separate site

**Referral Source**:
The place or campaign through which a visitor arrived, tracked separately from their Audience Signal.
_Avoid_: Audience, variant

**Audience Variant**:
An audience-specific presentation of the portfolio selected for a visitor. It may change available UI capabilities and composition. Client and Employer are the initial variants; more may be added without redefining the Default Experience.
_Avoid_: Variation, separate site, campaign page

**Client Variant**:
The Audience Variant emphasizing custom websites, applications, relevant proof, and the Project CTA for prospective clients.
_Avoid_: Freelance site

**Custom Website**:
A tailored public website that presents a person or business professionally and helps generate relevant inquiries.
_Avoid_: Brochure site, marketing site

**Custom Business Tool**:
A tailored system that improves how a business operates, such as booking, client management, dashboards, integrations, or workflow automation.
_Avoid_: App, application, software solution

**Employer Variant**:
The Audience Variant emphasizing professional experience, technical depth, and résumé access for hiring visitors.
_Avoid_: Job site, recruiter site

**Job Target**:
A specific role or application for which the Employer Variant's copy is tailored. It does not create a separate Audience Variant or change available capabilities.
_Avoid_: Employer sub-variant, job variation, separate portfolio

**Job Tailoring**:
Adjustments to copy, evidence order, and résumé link that make the Employer Variant relevant to a Job Target while preserving its components, underlying facts, and capabilities.
_Avoid_: Audience Variant, redesign

**Tailoring Profile**:
A constrained set of adjustments applied within an Audience Variant. Employer Job Tailoring is the first use; other Audience Variants may define their own profiles later.
_Avoid_: Sub-variant, child variation, separate page

**Audience Signal**:
Untrusted referral information that selects an Audience Variant and, optionally, a Tailoring Profile. It affects public presentation only and never grants access; without a valid signal or saved selection, the visitor receives the Default Experience.
_Avoid_: Tracking code, URL variation

**Saved Selection**:
A validated Audience Variant and optional Tailoring Profile remembered for 90 days and refreshed on visits. Plain `girke.dev` reuses it; a newer valid Audience Signal replaces it. It changes only through a newer valid Entry Link, expiry, or browser cookie deletion; the site exposes no audience switcher or reset control.
_Avoid_: User preference, session, tracking cookie

**Entry Link**:
A shareable `girke.dev/r/<opaque-code>` URL carrying an Audience Signal. It directly presents the selected public experience before the browser simplifies the visible URL to `girke.dev`.
_Avoid_: Short link, tracking URL, referral URL

**Project CTA**:
The primary client invitation to “Discuss your project,” leading to the contact page. The launch contact channel is email; a configured booking action can be added there.
_Avoid_: Contact button, booking button

**Contact Mechanism**:
The channel through which a prospective client responds to the Project CTA, initially a prefilled email and later a discovery-call booking flow.
_Avoid_: CTA
