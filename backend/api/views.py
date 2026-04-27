from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q, Count, Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Complaint, ComplaintActivity
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ComplaintSerializer, ComplaintSubmitSerializer,
    UpdateStatusSerializer, UpdatePrioritySerializer, AssignDepartmentSerializer, 
    AddRemarkSerializer, RateComplaintSerializer,
    SendOTPSerializer, VerifyOTPSerializer,
)
from .permissions import IsAdmin, IsStudent, IsAdminOrOwner


# ── Helpers ───────────────────────────────────────────────────────────────────

def _token_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    }


def _error(msg, code=status.HTTP_400_BAD_REQUEST):
    return Response({'error': msg}, status=code)


def _log_activity(complaint, action, description, user=None):
    """Helper to log complaint activities"""
    ComplaintActivity.objects.create(
        complaint=complaint,
        action=action,
        description=description,
        performed_by=user
    )


def _send_notification_email(to_email, subject, message):
    """Helper to send notification emails"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=True,
        )
    except Exception:
        pass  # Don't fail if email sending fails


# ── Auth endpoints ────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """POST /api/register — student self-registration (requires verified email)."""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email is verified
    email = serializer.validated_data['email']
    from .models import EmailOTP
    verified_otp = EmailOTP.objects.filter(
        email=email,
        is_used=True
    ).exists()
    
    if not verified_otp:
        return _error('Email not verified. Please verify your email first.', status.HTTP_400_BAD_REQUEST)
    
    user = serializer.save()
    user.email_verified = True
    user.save(update_fields=['email_verified'])
    
    return Response(
        {'message': 'Registration successful.', **_token_response(user)},
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """POST /api/login — student or admin login (email or roll number)."""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    identifier = serializer.validated_data['email_or_roll']
    password = serializer.validated_data['password']

    # Resolve identifier to email
    if '@' in identifier:
        email = identifier
    else:
        try:
            email = User.objects.get(roll_number=identifier).email
        except User.DoesNotExist:
            return _error('Invalid credentials.', status.HTTP_401_UNAUTHORIZED)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return _error('Invalid credentials.', status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return _error('Account is disabled.', status.HTTP_403_FORBIDDEN)

    return Response({'message': 'Login successful.', **_token_response(user)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /api/logout — blacklist the refresh token."""
    try:
        RefreshToken(request.data.get('refresh')).blacklist()
    except Exception:
        pass  # token already invalid — that's fine
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """GET /api/me — current user profile."""
    return Response(UserSerializer(request.user).data)


# ── Student endpoints ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_complaint(request):
    """POST /api/submit-complaint — student submits a new grievance."""
    serializer = ComplaintSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle anonymous complaints
    is_anonymous = serializer.validated_data.get('is_anonymous', False)
    if is_anonymous:
        complaint = serializer.save(student=None, is_anonymous=True)
    else:
        complaint = serializer.save(student=request.user, is_anonymous=False)
    
    # Log activity
    _log_activity(
        complaint, 
        'created', 
        f'Complaint created: {complaint.title}',
        request.user if not is_anonymous else None
    )
    
    # Send notification to admins (get first admin)
    admin = User.objects.filter(role='admin').first()
    if admin:
        _send_notification_email(
            admin.email,
            f'New Grievance Submitted - {complaint.complaint_id}',
            f'A new grievance has been submitted.\n\n'
            f'ID: {complaint.complaint_id}\n'
            f'Title: {complaint.title}\n'
            f'Category: {complaint.category}\n'
            f'Priority: {complaint.priority}\n'
            f'Assigned to: {complaint.assigned_department}\n\n'
            f'Please review and take action.'
        )
    
    return Response(
        {
            'message': 'Complaint submitted successfully.',
            'complaint_id': complaint.complaint_id,
            'complaint': ComplaintSerializer(complaint).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complaints_list(request):
    """
    GET /api/complaints
    - Students: returns only their own complaints.
    - Admins: returns all complaints with filters.
    """
    qs = Complaint.objects.select_related('student').prefetch_related('activities')

    if request.user.role == 'student':
        qs = qs.filter(student=request.user)
    else:
        # Admin filters
        status_filter = request.query_params.get('status')
        category_filter = request.query_params.get('category')
        priority_filter = request.query_params.get('priority')
        department_filter = request.query_params.get('department')
        
        if status_filter and status_filter != 'all':
            qs = qs.filter(status=status_filter)
        if category_filter and category_filter != 'all':
            qs = qs.filter(category=category_filter)
        if priority_filter and priority_filter != 'all':
            qs = qs.filter(priority=priority_filter)
        if department_filter and department_filter != 'all':
            qs = qs.filter(assigned_department=department_filter)

    search = request.query_params.get('search')
    if search:
        qs = qs.filter(
            Q(complaint_id__icontains=search) |
            Q(title__icontains=search) |
            Q(student__name__icontains=search) |
            Q(student__roll_number__icontains=search)
        )

    serializer = ComplaintSerializer(qs, many=True)
    return Response({'count': qs.count(), 'results': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complaint_detail(request, complaint_id):
    """GET /api/complaint/<complaint_id> — retrieve a single complaint."""
    complaint = get_object_or_404(Complaint.objects.prefetch_related('activities'), complaint_id=complaint_id)

    # Students can only view their own (unless anonymous)
    if request.user.role == 'student' and complaint.student and complaint.student != request.user:
        return _error('Not found.', status.HTTP_404_NOT_FOUND)

    return Response(ComplaintSerializer(complaint).data)


@api_view(['POST'])
@permission_classes([IsStudent])
def rate_complaint(request, complaint_id):
    """POST /api/rate-complaint/<complaint_id> — student rates resolved complaint."""
    complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
    
    # Only the complaint owner can rate (if not anonymous)
    if complaint.student and complaint.student != request.user:
        return _error('You can only rate your own complaints.', status.HTTP_403_FORBIDDEN)
    
    # Can only rate resolved complaints
    if complaint.status != 'resolved':
        return _error('You can only rate resolved complaints.', status.HTTP_400_BAD_REQUEST)
    
    serializer = RateComplaintSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    complaint.rating = serializer.validated_data['rating']
    complaint.feedback = serializer.validated_data.get('feedback', '')
    complaint.save(update_fields=['rating', 'feedback', 'updated_at'])
    
    # Log activity
    _log_activity(
        complaint,
        'rated',
        f'Student rated the resolution: {complaint.rating}/5 stars',
        request.user
    )
    
    return Response({'message': 'Thank you for your feedback!', 'complaint': ComplaintSerializer(complaint).data})


# ── Admin endpoints ───────────────────────────────────────────────────────────

@api_view(['PUT'])
@permission_classes([IsAdmin])
def update_status(request, complaint_id):
    """PUT /api/update-status/<complaint_id>"""
    complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
    old_status = complaint.status
    
    serializer = UpdateStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    new_status = serializer.validated_data['status']
    complaint.status = new_status
    complaint.save(update_fields=['status', 'updated_at', 'resolved_at'])
    
    # Log activity
    _log_activity(
        complaint,
        'status_changed',
        f'Status changed from {old_status} to {new_status}',
        request.user
    )
    
    # Send notification to student
    if complaint.student:
        _send_notification_email(
            complaint.student.email,
            f'Grievance Status Updated - {complaint.complaint_id}',
            f'Your grievance status has been updated.\n\n'
            f'ID: {complaint.complaint_id}\n'
            f'Title: {complaint.title}\n'
            f'New Status: {new_status.upper()}\n\n'
            f'Track your grievance: http://localhost:3000/student/track?id={complaint.complaint_id}'
        )
    
    return Response({'message': 'Status updated.', 'complaint': ComplaintSerializer(complaint).data})


@api_view(['PUT'])
@permission_classes([IsAdmin])
def update_priority(request, complaint_id):
    """PUT /api/update-priority/<complaint_id>"""
    complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
    old_priority = complaint.priority
    
    serializer = UpdatePrioritySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    new_priority = serializer.validated_data['priority']
    complaint.priority = new_priority
    complaint.save(update_fields=['priority', 'updated_at'])
    
    # Log activity
    _log_activity(
        complaint,
        'status_changed',
        f'Priority changed from {old_priority} to {new_priority}',
        request.user
    )
    
    return Response({'message': 'Priority updated.', 'complaint': ComplaintSerializer(complaint).data})


@api_view(['PUT'])
@permission_classes([IsAdmin])
def assign_department(request, complaint_id):
    """PUT /api/assign-department/<complaint_id>"""
    complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
    old_dept = complaint.assigned_department
    
    serializer = AssignDepartmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    new_dept = serializer.validated_data['assigned_department']
    complaint.assigned_department = new_dept
    complaint.save(update_fields=['assigned_department', 'updated_at'])
    
    # Log activity
    _log_activity(
        complaint,
        'assigned',
        f'Assigned to {new_dept}' + (f' (previously: {old_dept})' if old_dept else ''),
        request.user
    )
    
    return Response({'message': 'Department assigned.', 'complaint': ComplaintSerializer(complaint).data})


@api_view(['PUT'])
@permission_classes([IsAdmin])
def add_remark(request, complaint_id):
    """PUT /api/add-remark/<complaint_id>"""
    complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
    
    serializer = AddRemarkSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    remark = serializer.validated_data['remarks']
    complaint.remarks = remark
    complaint.save(update_fields=['remarks', 'updated_at'])
    
    # Log activity
    _log_activity(
        complaint,
        'remark_added',
        f'Admin added remark: {remark[:50]}...' if len(remark) > 50 else f'Admin added remark: {remark}',
        request.user
    )
    
    # Send notification to student
    if complaint.student:
        _send_notification_email(
            complaint.student.email,
            f'New Update on Your Grievance - {complaint.complaint_id}',
            f'An admin has added a remark to your grievance.\n\n'
            f'ID: {complaint.complaint_id}\n'
            f'Title: {complaint.title}\n'
            f'Remark: {remark}\n\n'
            f'Track your grievance: http://localhost:3000/student/track?id={complaint.complaint_id}'
        )
    
    return Response({'message': 'Remark added.', 'complaint': ComplaintSerializer(complaint).data})


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_stats(request):
    """GET /api/admin/stats — dashboard summary counts and analytics."""
    from datetime import timedelta
    from django.db.models import Avg, Count
    from django.db.models.functions import TruncDate
    
    total = Complaint.objects.count()
    pending = Complaint.objects.filter(status='pending').count()
    in_progress = Complaint.objects.filter(status='in-progress').count()
    resolved = Complaint.objects.filter(status='resolved').count()
    
    # Calculate average resolution time (in hours)
    resolved_complaints = Complaint.objects.filter(status='resolved', resolved_at__isnull=False)
    avg_resolution_hours = None
    if resolved_complaints.exists():
        total_hours = sum([
            (c.resolved_at - c.created_at).total_seconds() / 3600 
            for c in resolved_complaints
        ])
        avg_resolution_hours = round(total_hours / resolved_complaints.count(), 1)
    
    # Category breakdown
    by_category = list(Complaint.objects.values('category').annotate(count=Count('id')))
    
    # Priority breakdown
    by_priority = list(Complaint.objects.values('priority').annotate(count=Count('id')))
    
    # Department breakdown
    by_department = list(Complaint.objects.exclude(assigned_department__isnull=True).values('assigned_department').annotate(count=Count('id')))
    
    # Average rating
    avg_rating = Complaint.objects.filter(rating__isnull=False).aggregate(avg=Avg('rating'))['avg']
    if avg_rating:
        avg_rating = round(avg_rating, 1)
    
    # Recent complaints (last 30 days trend)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_trend = list(
        Complaint.objects.filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    
    return Response({
        'total': total,
        'pending': pending,
        'in_progress': in_progress,
        'resolved': resolved,
        'avg_resolution_hours': avg_resolution_hours,
        'avg_rating': avg_rating,
        'by_category': by_category,
        'by_priority': by_priority,
        'by_department': by_department,
        'recent_trend': recent_trend,
    })


# ── Email Verification ────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """POST /api/send-otp — send OTP to email for verification."""
    serializer = SendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already registered
    email = serializer.validated_data['email']
    if User.objects.filter(email=email).exists():
        return _error('Email already registered.', status.HTTP_400_BAD_REQUEST)
    
    try:
        serializer.send_otp()
        return Response({'message': 'OTP sent successfully to your email.'})
    except Exception as e:
        return _error(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """POST /api/verify-otp — verify OTP for email."""
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark OTP as used
    otp_record = serializer.validated_data['otp_record']
    otp_record.is_used = True
    otp_record.save(update_fields=['is_used'])
    
    return Response({'message': 'Email verified successfully. You can now complete registration.'})
