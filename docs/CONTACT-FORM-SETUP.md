# Contact Form Setup

The help center includes a contact form that users can submit for support, bug reports, improvements, or template submissions.

## Form Submission Service

By default, the form uses [FormSubmit.co](https://formsubmit.co), a free form backend service that forwards submissions to your email.

### Setup Steps

1. **Set Your Support Email**
   
   Create or edit `.env` file in the project root:
   ```env
   VITE_SUPPORT_EMAIL=your-actual-email@example.com
   ```

2. **Verify Your Email with FormSubmit.co**
   
   - Deploy your app or run it locally
   - Open the help center and submit a test form
   - Check your inbox for a verification email from FormSubmit.co
   - Click the verification link
   - Future submissions will now be delivered to your email

3. **Test the Form**
   
   After verification, submit another test message to confirm it arrives.

## Using a Custom Backend (Optional)

If you prefer to use your own API endpoint instead of FormSubmit.co:

1. Add this to your `.env` file:
   ```env
   VITE_SUPPORT_FORM_ENDPOINT=https://your-api.com/contact
   ```

2. Your endpoint should accept POST requests with JSON body:
   ```json
   {
     "category": "support|glitch|improvement|template",
     "categoryLabel": "Support",
     "name": "User Name",
     "email": "user@example.com",
     "message": "Support request message",
     "extra": "Optional extra field content",
     "language": "fr|en",
     "submittedAt": "2025-11-23T12:00:00.000Z",
     "product": "ECHO-BT-CTD",
     "templateDetails": { /* only for template submissions */ }
   }
   ```

3. Return a 200 status on success, or 4xx/5xx on error.

## Error Messages

If form submission fails, users see a generic error message without exposing your email address. The actual submission error is logged to the browser console for debugging.

## Security Notes

- Your support email is never exposed to users in error messages
- FormSubmit.co requires email verification to prevent spam
- All submissions include timestamp and product identifier
- Consider adding CAPTCHA if you experience spam (FormSubmit.co offers this)
