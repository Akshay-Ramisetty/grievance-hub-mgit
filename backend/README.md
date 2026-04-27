# GrievanceHub-MGIT — Backend

Django REST Framework backend for the GrievanceHub-MGIT college grievance management system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django 5 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | SQLite (dev) / MySQL / PostgreSQL |
| File uploads | Django `FileField` → `media/` folder |
| CORS | `django-cors-headers` |

---

## Project Structure

```
backend/
├── grievancehub/          # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/                   # Main app
│   ├── models.py          # User + Complaint models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # All API views
│   ├── urls.py            # URL routing
│   ├── permissions.py     # IsStudent / IsAdmin guards
│   ├── admin.py           # Django admin config
│   └── management/
│       └── commands/
│           └── seed_admin.py
├── manage.py
├── requirements.txt
└── .env.example
```

---

## Quick Start

### 1. Create & activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY
```

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Seed the default admin account

```bash
python manage.py seed_admin
# Creates: admin@mgit.edu / Admin@1234
```

### 6. Start the dev server

```bash
python manage.py runserver
# API available at http://127.0.0.1:8000/api/
```

---

## Switching to MySQL or PostgreSQL

In `.env`:

```
DB_ENGINE=mysql          # or postgresql
DB_NAME=grievancehub
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306             # 5432 for PostgreSQL
```

Then run `python manage.py migrate`.

---

## API Reference

All endpoints are prefixed with `/api/`.  
Protected routes require `Authorization: Bearer <access_token>`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Student registration |
| POST | `/api/login` | Public | Login (email or roll number) |
| POST | `/api/logout` | Required | Invalidate refresh token |
| POST | `/api/token/refresh` | Public | Refresh access token |
| GET | `/api/me` | Required | Current user profile |

#### POST /api/register

```json
{
  "name": "Rahul Sharma",
  "roll_number": "20CS101",
  "email": "rahul@mgit.edu",
  "department": "Computer Science",
  "password": "Secret@123",
  "confirm_password": "Secret@123"
}
```

#### POST /api/login

```json
{
  "email_or_roll": "rahul@mgit.edu",
  "password": "Secret@123"
}
```

Response:
```json
{
  "message": "Login successful.",
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": { "id": "...", "name": "...", "role": "student", ... }
}
```

---

### Complaints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/submit-complaint` | Required | Student | Submit a new complaint |
| GET | `/api/complaints` | Required | Any | Student: own; Admin: all |
| GET | `/api/complaint/<id>` | Required | Any | Get single complaint |
| PUT | `/api/update-status/<id>` | Required | Admin | Change status |
| PUT | `/api/assign-department/<id>` | Required | Admin | Assign department |
| PUT | `/api/add-remark/<id>` | Required | Admin | Add remark |
| GET | `/api/admin/stats` | Required | Admin | Dashboard counts |

#### POST /api/submit-complaint (multipart/form-data)

```
title        = "Library AC not working"
category     = "facilities"          # academics | facilities | administration | other
description  = "The AC in the main library..."
attachment   = <file>  (optional, max 10 MB)
```

#### GET /api/complaints (admin query params)

```
?status=pending          # pending | in-progress | resolved
?category=facilities
?search=rahul
```

#### PUT /api/update-status/<complaint_id>

```json
{ "status": "in-progress" }
```

#### PUT /api/assign-department/<complaint_id>

```json
{ "assigned_department": "Facilities Management" }
```

#### PUT /api/add-remark/<complaint_id>

```json
{ "remarks": "Technician has been dispatched." }
```

---

## Frontend Integration

In your Next.js app set:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Store the JWT `access` token (e.g. in `localStorage` or a cookie) and send it as:

```
Authorization: Bearer <access_token>
```

Use `POST /api/token/refresh` with `{ "refresh": "<token>" }` to silently renew sessions.
