# Portfolio Variants

Working design decisions from the audience-variant grilling session.

## Experience hierarchy

- Default Experience: balanced presentation for plain `girke.dev` when no Saved Selection exists.
- Client Variant: may change UI capabilities and composition for prospective clients.
- Employer Variant: may change UI capabilities and composition for hiring visitors.
- Tailoring Profiles: constrained overlays within an Audience Variant.
- Employer Job Tailoring: may change copy, evidence order, and résumé link, but not components, underlying facts, or capabilities.
- The tailoring mechanism remains generic so other Audience Variants can gain profiles later.

Shared project, employment, and professional data remains authoritative across all experiences.

## Client Variant

Primary audience: independent professionals and owner-led small businesses. This guides emphasis without adding exclusionary copy.

Primary offers:

- Custom Websites
- Custom Business Tools

Client positioning: premium, carefully finished custom work at the lower overhead of an independent developer. For websites, frame this as helping the business look established without the cost and complexity of a large agency; avoid generic “reasonable prices” language that could imply bargain work.

The underlying differentiator is experienced software craftsmanship in a market crowded with hastily AI-generated websites: the work is intentionally designed, properly engineered, thoroughly checked, and only shipped at a high quality bar. Public copy should translate this into client outcomes and credible working practices rather than relying on technical credentials alone.

Hero direction:

> **Websites and tools built around how you work.**
>
> I design and build custom websites that present your work clearly—and business tools that make running it easier.

Primary CTA: **Discuss your project**

The CTA wording remains stable and navigates to a dedicated Client Variant contact page. That page follows the referenced Ryan Gittings composition: prominent invitation and booking action on one side, with the complete inquiry form visible alongside it. Initially the booking area offers a prefilled email action. Once ready, it offers hosted Cal.com discovery-call booking as the primary action and the inquiry form as the secondary action. Booking opens the full Cal.com interface in a new tab rather than an embedded modal. `calendar.girke.dev` is the permanent public booking address and redirects to the hosted Cal.com event. Cal.com will not be self-hosted. `meet.girke.dev` is reserved for the separately self-hosted Jitsi service and must not be used for discovery-call scheduling.

The quick inquiry form contains only:

- Name
- Email
- “What can I help you build?”

It does not initially request a budget, company, phone number, or technical details.

The Ryan Gittings contact page is a composition reference, not a field-for-field template. In particular, the Client Variant does not show a budget selector: the inquiry path should feel welcoming rather than qualifying visitors upfront.

The contact page always presents three paths: book a discovery call, submit the quick inquiry form, or email directly. The direct email address remains visible rather than being hidden behind the form.

The page sets the expectation: “I usually reply within two business days.”

After a successful form submission, the visitor remains on the contact page and the form is replaced with: “Thanks—I’ve got your message. I’ll reply within two business days.” No separate success page is used.

## Client page structure

The initial Client Variant is primarily one scrolling homepage containing the hero, services, selected work, process, and about content. It adds one dedicated `/contact` page for booking, the inquiry form, and direct email. Separate Services, About, and Process pages are deferred until their content warrants them. Individual case-study pages may be added later.

The homepage order is:

1. Hero and Project CTA
2. Services: Custom Websites and Custom Business Tools
3. Selected work, beginning with Kristina Girke
4. Simple working process
5. About
6. Final Project CTA

## Audience controls

The site exposes no audience switcher, cross-audience callout, or reset control. A Saved Selection changes only through a newer valid Entry Link, 90-day expiry, or browser cookie deletion.

## Entry links

See [ADR 0001](./adr/0001-use-same-domain-entry-links.md).
