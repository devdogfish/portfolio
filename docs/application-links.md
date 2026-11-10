# Application links

`GET https://girke.dev/api/links` lists available application variants and allowed original `sourceUrls`. `POST` to the same URL with `X-API-Key: <APPLICATION_LINKS_TOKEN>` and JSON:

```json
{"applicationId":"11111111-1111-4111-8111-111111111111","variant":"software","company":"Example","role":"Developer","revision":1}
```

Variants are `software`, `web-cms`, and `admin-excel`; their resume track names `engineering`, `web`, and `admin` also work. Use a stable UUID per application and increment the positive revision when its details change. Repeating a registration is safe; conflicting or older revisions return 409. Do not expose the token in client-side code.

The response contains ready-to-use `portfolio`, `profiles.github`, `profiles.linkedin`, and `projects.<slug>.page`, `.demo` (when available), and `.sources.<repoSlug>` links. For document rendering, add `"format":"replacements"` to receive only a flat map from original URLs to tracked URLs. The server returns 400 for invalid input, 401 for invalid credentials, 413 for bodies over 4096 bytes, and 503 when the registry is unavailable.

`lib/data.ts` owns project data; `lib/link-catalog.ts` derives destinations and is shared by the router, this API, and the compatibility endpoint `/api/link-catalog`. `app/api/links/route.ts` validates and forwards registrations to the configured `APPLICATION_LINKS_REGISTRY_URL` with the internal token. Quantself's registry owns application identity and revision conflict checks. Keep destination definitions centralized, and do not expose registry credentials or register a separate destination map.
