# JiGR Email Template Testing Commands

## Health Check
```bash
curl -s http://localhost:3000/api/test-email
```

## Test Password Reset Email
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your@email.com", "templateType": "password-reset"}'
```

## Test Connection Email
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your@email.com", "templateType": "connection-test"}'
```

## Test URLs
- Health Check: http://localhost:3000/api/test-email
- Send Test Email: POST to http://localhost:3000/api/test-email

## Example Response (Success)
```json
{
  "success": true,
  "message": "password-reset email sent successfully", 
  "messageId": "re_xyz123",
  "templateType": "password-reset",
  "recipient": "test@example.com"
}
```

## Available Templates
- `password-reset` - Professional password reset with security info
- `welcome` - Welcome email for new users with onboarding info
- `welcome-invite` - Welcome email for invited team members
- `email-verification` - Email address verification with secure link
- `connection-test` - Simple connectivity test email