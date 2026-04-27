import uuid
import random
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [('student', 'Student'), ('admin', 'Admin')]
    DEPARTMENT_CHOICES = [
        ('Computer Science', 'Computer Science'),
        ('Electronics', 'Electronics'),
        ('Mechanical', 'Mechanical'),
        ('Civil', 'Civil'),
        ('Electrical', 'Electrical'),
        ('Information Technology', 'Information Technology'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    roll_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.name} ({self.email})'


def complaint_upload_path(instance, filename):
    return f'complaints/{instance.complaint_id}/{filename}'


class Complaint(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    CATEGORY_CHOICES = [
        ('academics', 'Academics'),
        ('facilities', 'Facilities'),
        ('hostel', 'Hostel'),
        ('library', 'Library'),
        ('infrastructure', 'Infrastructure'),
        ('administration', 'Administration'),
        ('other', 'Other'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    DEPARTMENT_CHOICES = [
        ('Academic Affairs', 'Academic Affairs'),
        ('Student Services', 'Student Services'),
        ('Facilities Management', 'Facilities Management'),
        ('IT Department', 'IT Department'),
        ('Hostel Administration', 'Hostel Administration'),
        ('Library', 'Library'),
        ('Maintenance', 'Maintenance'),
        ('Administration', 'Administration'),
    ]

    complaint_id = models.CharField(max_length=30, unique=True, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints', null=True, blank=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    assigned_department = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to=complaint_upload_path, blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    feedback = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.complaint_id:
            self.complaint_id = self._generate_complaint_id()
        
        # Auto-assign department based on category
        if not self.assigned_department and self.category:
            category_to_dept = {
                'academics': 'Academic Affairs',
                'facilities': 'Facilities Management',
                'hostel': 'Hostel Administration',
                'library': 'Library',
                'infrastructure': 'Maintenance',
                'administration': 'Administration',
            }
            self.assigned_department = category_to_dept.get(self.category, 'Administration')
        
        # Set resolved_at timestamp when status changes to resolved
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_complaint_id():
        import time, random, string
        ts = hex(int(time.time()))[2:].upper()
        rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f'GH-{ts}-{rand}'

    def __str__(self):
        return f'{self.complaint_id} — {self.title}'


class ComplaintActivity(models.Model):
    """Track all actions performed on a complaint"""
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('assigned', 'Assigned to Department'),
        ('status_changed', 'Status Changed'),
        ('remark_added', 'Remark Added'),
        ('resolved', 'Resolved'),
        ('rated', 'Rated by Student'),
    ]
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_activities'
        ordering = ['-created_at']
        verbose_name_plural = 'Complaint Activities'
    
    def __str__(self):
        return f'{self.complaint.complaint_id} - {self.action}'


class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'email_otps'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    @staticmethod
    def generate_otp():
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self):
        return f'{self.email} - {self.otp}'
