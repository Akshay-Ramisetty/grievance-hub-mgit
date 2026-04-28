# Code Snippets for PPT Presentation

## 1. FRONTEND CODE (Next.js + React + TypeScript)

### Landing Page Component (app/page.tsx)
```typescript
import Link from "next/link"
import Image from "next/image"
import { Search, CheckCircle, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="landing min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/mgit-logo.png" alt="MGIT" width={40} height={40} />
            <span className="font-bold">GrievanceHub-MGIT</span>
          </div>
          <div className="flex gap-2">
            <Link href="/student/login">Login</Link>
            <Link href="/student/register">Register</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">MGIT Grievance Portal</h1>
        <p className="text-lg text-gray-600 mb-8">
          Submit and track grievances efficiently and transparently
        </p>
        <Link href="/student/register" className="btn-primary">
          Get Started
        </Link>
      </section>
    </div>
  )
}
```

### API Client (lib/api.ts)
```typescript
const BASE = "https://grievance-hub-mgit-production.up.railway.app/api"

// Login Function
export async function apiLogin(data: {
  email_or_roll: string
  password: string
}) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  
  if (!res.ok) throw new Error("Login failed")
  
  const result = await res.json()
  localStorage.setItem("access_token", result.access)
  return result
}

// Submit Complaint
export async function apiSubmitComplaint(data: FormData) {
  const token = localStorage.getItem("access_token")
  
  const res = await fetch(`${BASE}/submit-complaint`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: data
  })
  
  return res.json()
}

// Get Complaints
export async function apiGetComplaints() {
  const token = localStorage.getItem("access_token")
  
  const res = await fetch(`${BASE}/complaints`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  
  return res.json()
}
```

### Student Dashboard (app/student/dashboard/page.tsx)
```typescript
"use client"
import { useState, useEffect } from "react"
import { apiGetComplaints } from "@/lib/api"

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGetComplaints()
      .then(data => setComplaints(data.results))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Complaints</h1>
      
      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <div key={complaint.complaint_id} className="card p-4 border rounded">
            <h3 className="font-semibold">{complaint.title}</h3>
            <p className="text-sm text-gray-600">{complaint.category}</p>
            <span className={`badge ${complaint.status}`}>
              {complaint.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 2. BACKEND CODE (Django + Python)

### Database Models (backend/api/models.py)
```python
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [('student', 'Student'), ('admin', 'Admin')]
    
    roll_number = models.CharField(max_length=20, unique=True, null=True)
    department = models.CharField(max_length=100, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    email_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

class Complaint(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('resolved', 'Resolved')
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ]
    
    complaint_id = models.CharField(max_length=20, unique=True, default=uuid.uuid4)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    assigned_department = models.CharField(max_length=100, null=True)
    remarks = models.TextField(null=True, blank=True)
    attachment = models.FileField(upload_to='complaints/', null=True)
    is_anonymous = models.BooleanField(default=False)
    rating = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ComplaintActivity(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
```

### API Views (backend/api/views.py)
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from .models import User, Complaint, ComplaintActivity
from .serializers import ComplaintSerializer, UserSerializer
import random
from datetime import datetime, timedelta

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Student registration"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login with JWT"""
    from rest_framework_simplejwt.tokens import RefreshToken
    
    email_or_roll = request.data.get('email_or_roll')
    password = request.data.get('password')
    
    user = User.objects.filter(email=email_or_roll).first() or \
           User.objects.filter(roll_number=email_or_roll).first()
    
    if user and user.check_password(password):
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    
    return Response({'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_complaint(request):
    """Submit a new complaint"""
    data = request.data.copy()
    data['student'] = request.user.id
    
    serializer = ComplaintSerializer(data=data)
    if serializer.is_valid():
        complaint = serializer.save()
        
        # Create activity log
        ComplaintActivity.objects.create(
            complaint=complaint,
            action='created',
            description=f'Complaint created by {request.user.name}',
            performed_by=request.user
        )
        
        # Send email notification
        send_mail(
            subject=f'New Complaint: {complaint.complaint_id}',
            message=f'Your complaint has been submitted successfully.',
            from_email='mgitgrievancehub@gmail.com',
            recipient_list=[request.user.email],
            fail_silently=True
        )
        
        return Response({
            'complaint_id': complaint.complaint_id,
            'complaint': ComplaintSerializer(complaint).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_complaints(request):
    """Get all complaints (filtered by user role)"""
    if request.user.role == 'admin':
        complaints = Complaint.objects.all()
    else:
        complaints = Complaint.objects.filter(student=request.user)
    
    # Apply filters
    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        complaints = complaints.filter(status=status_filter)
    
    serializer = ComplaintSerializer(complaints, many=True)
    return Response({
        'count': complaints.count(),
        'results': serializer.data
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_status(request, complaint_id):
    """Update complaint status (Admin only)"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    complaint = Complaint.objects.get(complaint_id=complaint_id)
    new_status = request.data.get('status')
    
    complaint.status = new_status
    if new_status == 'resolved':
        complaint.resolved_at = datetime.now()
    complaint.save()
    
    # Log activity
    ComplaintActivity.objects.create(
        complaint=complaint,
        action='status_updated',
        description=f'Status changed to {new_status}',
        performed_by=request.user
    )
    
    # Send email notification
    send_mail(
        subject=f'Complaint Status Updated: {complaint.complaint_id}',
        message=f'Your complaint status has been updated to {new_status}.',
        from_email='mgitgrievancehub@gmail.com',
        recipient_list=[complaint.student.email],
        fail_silently=True
    )
    
    return Response({'complaint': ComplaintSerializer(complaint).data})

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP for email verification"""
    email = request.data.get('email')
    otp = str(random.randint(100000, 999999))
    
    # Save OTP
    EmailOTP.objects.create(
        email=email,
        otp=otp,
        expires_at=datetime.now() + timedelta(minutes=10)
    )
    
    # Send email
    send_mail(
        subject='Email Verification - GrievanceHub MGIT',
        message=f'Your OTP is: {otp}\nValid for 10 minutes.',
        from_email='mgitgrievancehub@gmail.com',
        recipient_list=[email],
        fail_silently=False
    )
    
    return Response({'message': 'OTP sent successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get dashboard statistics (Admin only)"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Count, Avg
    
    stats = {
        'total': Complaint.objects.count(),
        'pending': Complaint.objects.filter(status='pending').count(),
        'in_progress': Complaint.objects.filter(status='in-progress').count(),
        'resolved': Complaint.objects.filter(status='resolved').count(),
        'avg_rating': Complaint.objects.filter(rating__isnull=False)
                               .aggregate(Avg('rating'))['rating__avg'],
        'by_category': list(Complaint.objects.values('category')
                                     .annotate(count=Count('id'))),
        'by_priority': list(Complaint.objects.values('priority')
                                     .annotate(count=Count('id')))
    }
    
    return Response(stats)
```

### URL Configuration (backend/api/urls.py)
```python
from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register', views.register),
    path('login', views.login),
    path('logout', views.logout),
    
    # Email Verification
    path('send-otp', views.send_otp),
    path('verify-otp', views.verify_otp),
    
    # Complaints
    path('submit-complaint', views.submit_complaint),
    path('complaints', views.get_complaints),
    path('complaint/<str:complaint_id>', views.get_complaint),
    path('update-status/<str:complaint_id>', views.update_status),
    path('update-priority/<str:complaint_id>', views.update_priority),
    path('assign-department/<str:complaint_id>', views.assign_department),
    path('add-remark/<str:complaint_id>', views.add_remark),
    path('rate-complaint/<str:complaint_id>', views.rate_complaint),
    
    # Admin
    path('admin/stats', views.admin_stats),
]
```

---

## 3. DATABASE SCHEMA (SQL)

### Create Tables
```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    name VARCHAR(200) NOT NULL,
    roll_number VARCHAR(20) UNIQUE,
    department VARCHAR(100),
    role VARCHAR(10) DEFAULT 'student',
    email_verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    student_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_department VARCHAR(100),
    remarks TEXT,
    attachment VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT 0,
    rating INTEGER,
    feedback TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Complaint Activities Table
CREATE TABLE complaint_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    performed_by_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (performed_by_id) REFERENCES users(id)
);

-- Email OTP Table
CREATE TABLE email_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(254) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for Performance
CREATE INDEX idx_complaints_student ON complaints(student_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_activities_complaint ON complaint_activities(complaint_id);
```

### Sample Queries
```sql
-- Get all pending complaints
SELECT * FROM complaints WHERE status = 'pending' ORDER BY created_at DESC;

-- Get complaints by student
SELECT * FROM complaints WHERE student_id = 1;

-- Get complaint with student details
SELECT 
    c.complaint_id,
    c.title,
    c.status,
    u.name as student_name,
    u.email as student_email
FROM complaints c
JOIN users u ON c.student_id = u.id
WHERE c.complaint_id = 'GH-12345678-ABCD';

-- Get statistics
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
    AVG(rating) as avg_rating
FROM complaints;

-- Get complaints by category
SELECT category, COUNT(*) as count 
FROM complaints 
GROUP BY category 
ORDER BY count DESC;
```

---

## 4. CONFIGURATION FILES

### Frontend Package.json
```json
{
  "name": "grievance-hub-mgit",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "16.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.460.0",
    "recharts": "^2.15.0"
  }
}
```

### Backend Requirements.txt
```txt
Django==5.0.6
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
Pillow==10.4.0
gunicorn==21.2.0
```

### Django Settings (Key Parts)
```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://grievance-hub-mgit-gwnk.vercel.app',
]

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'mgitgrievancehub@gmail.com'
EMAIL_HOST_PASSWORD = 'xyqyeruxwlewsmym'
```

---

## 5. DEPLOYMENT COMMANDS

### Frontend (Vercel)
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Backend (Railway)
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py seed_admin

# Start server
gunicorn grievancehub.wsgi
```

---

**Use these code snippets in your PPT slides!** 📊
