# Email Verification with OTP

This document explains the email verification system implemented for student registration.

## Overview

Students must verify their email address before completing registration. This prevents fraud and ensures only valid MGIT students can register.

## How It Works

### 1. Registration Flow

The registration process now has 3 steps:

1. **Email Verification** - Student enters their @mgit.ac.in email
2. **OTP Verification** - Student enters the 6-digit OTP sent to their email
3. **Complete Registration** - Student fills in remaining details (name, roll number, etc.)

### 2. Backend Implementation

#### Models

**EmailOTP Model** (`backend/api/models.py`)
- Stores OTP codes with expiration (10 minutes)
- Tracks whether OTP has been used
- Automatically generates 6-digit numeric codes

**User Model Updates**
- Added `email_verified` field to track verification status

#### API Endpoints

**POST /api/send-otp**
- Validates email is @mgit.ac.in format
- Checks email isn't already registered
- Generates and sends 6-digit OTP
- OTP expires in 10 minutes

**POST /api/verify-otp**
- Validates OTP code
- Checks OTP hasn't expired or been used
- Marks OTP as used after successful verification

**POST /api/register** (Updated)
- Now requires email to be verified before registration
- Sets `email_verified=True` on successful registration

### 3. Email Configuration

#### Development Mode (Default)

By default, emails are printed to the console:

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

When you run the Django server, OTP emails will appear in the terminal.

#### Production Mode (SMTP)

For production, configure SMTP in your `.env` file:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@mgit.ac.in
```

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password (not your regular password) in `EMAIL_HOST_PASSWORD`

## Frontend Implementation

The registration page (`app/student/register/page.tsx`) now includes:

- **Step Indicator** - Visual progress through 3 steps
- **Email Input** - With validation for @mgit.ac.in format
- **OTP Input** - 6-digit numeric input with auto-formatting
- **Loading States** - Disabled inputs during API calls
- **Error Handling** - Clear error messages for each step

## Security Features

1. **Email Validation** - Only @mgit.ac.in emails accepted
2. **OTP Expiration** - Codes expire after 10 minutes
3. **Single Use** - OTPs can only be used once
4. **Rate Limiting** - Consider adding rate limiting in production
5. **Duplicate Prevention** - Checks if email already registered before sending OTP

## Testing

### Development Testing

1. Start the Django server:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. Start the Next.js frontend:
   ```bash
   npm run dev
   ```

3. Navigate to `/student/register`
4. Enter an @mgit.ac.in email
5. Check the Django console for the OTP code
6. Enter the OTP and complete registration

### Production Testing

1. Configure SMTP settings in `.env`
2. Test with a real @mgit.ac.in email
3. Verify email delivery
4. Complete registration flow

## Database Schema

### EmailOTP Table

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| email | EmailField | Email address |
| otp | CharField(6) | 6-digit OTP code |
| created_at | DateTimeField | When OTP was created |
| expires_at | DateTimeField | When OTP expires (created_at + 10 min) |
| is_used | BooleanField | Whether OTP has been used |

### User Table Updates

| Field | Type | Description |
|-------|------|-------------|
| email_verified | BooleanField | Whether email is verified (default: False) |

## API Examples

### Send OTP

```bash
curl -X POST http://localhost:8000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "student@mgit.ac.in"}'
```

Response:
```json
{
  "message": "OTP sent successfully to your email."
}
```

### Verify OTP

```bash
curl -X POST http://localhost:8000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "student@mgit.ac.in", "otp": "123456"}'
```

Response:
```json
{
  "message": "Email verified successfully. You can now complete registration."
}
```

### Register (After Verification)

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "roll_number": "21A91A0501",
    "email": "student@mgit.ac.in",
    "department": "Computer Science",
    "password": "securepass123",
    "confirm_password": "securepass123"
  }'
```

## Troubleshooting

### OTP Not Received

1. Check Django console (development mode)
2. Verify SMTP settings (production mode)
3. Check spam folder
4. Ensure email is @mgit.ac.in format

### OTP Expired

- OTPs expire after 10 minutes
- Request a new OTP by going back to step 1

### Email Already Registered

- The system checks if email is already registered before sending OTP
- Use the login page if you already have an account

## Future Enhancements

1. **Rate Limiting** - Limit OTP requests per email/IP
2. **Resend OTP** - Add button to resend OTP without going back
3. **SMS Verification** - Add phone number verification as alternative
4. **Email Templates** - Use HTML email templates for better formatting
5. **Admin Dashboard** - View OTP statistics and failed attempts
