# Contact Form Setup (Service Migration)

The help center contact form now requires an explicit endpoint. The previous automatic FormSubmit.co fallback has been removed to avoid silent failures.

## Recommended: Formspree

1. Create a free account at https://formspree.io/.
2. Create a new form – you receive an endpoint like:
   `https://formspree.io/f/xyz123ab`.
3. In `.env` set:
   ```env
   VITE_SUPPORT_EMAIL=echo-support@jskennedy.net
   VITE_SUPPORT_FORM_ENDPOINT=https://formspree.io/f/xyz123ab
   ```
4. Rebuild & redeploy:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```
5. Submit a test message. Success shows the green confirmation; errors show a generic message.

### Payload Structure
JSON POST sent to your endpoint:
```json
{
  "category": "support",
  "categoryLabel": "Support",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "message": "Issue description...",
  "extra": "Optional link",
  "language": "fr",
  "submittedAt": "2025-11-23T10:35:00.000Z",
  "product": "ECHO-BT-CTD",
  "templateDetails": { /* when category === 'template' */ }
}
```
Add `_subject` if you want a custom email subject in Formspree:
```js
payload._subject = `ECHO Contact: ${payload.categoryLabel}`
```

## Custom Backend Option

If you host your own endpoint (Cloudflare Worker, Vercel, Lambda):

1. Implement a POST handler that validates `email`, `message`.
2. Send the email via Resend, AWS SES, SendGrid, etc.
3. Return HTTP 200 with `{ ok: true }`.
4. Set `VITE_SUPPORT_FORM_ENDPOINT=https://yourdomain.com/contact`.

Minimal example:
```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const data = req.body || {}
  if (!data.email || !data.message) return res.status(400).json({ ok: false, error: 'missing_fields' })
  // send email logic here
  return res.json({ ok: true })
}
```

## UI Behavior Without Endpoint
If `VITE_SUPPORT_FORM_ENDPOINT` is blank, the form shows a yellow configuration warning and blocks submission.

## Troubleshooting
- Yellow box: Endpoint not set.
- 404: Formspree form ID incorrect.
- 422: Formspree validation failed (check required fields).
- CORS error: Ensure endpoint accepts standard browser POST (Formspree does by default).

## Security Notes
- No secrets stored client-side (public endpoint only).
- Use serverless proxy if you need API keys.
- Generic error messages prevent leaking addresses.
- Timestamp + product help with triage and audit.

## Next Steps
- Add endpoint → rebuild → test success.
- Monitor submissions in Formspree dashboard or server logs.
- Optionally extend payload with `_subject`, `_replyto`, or spam controls.
