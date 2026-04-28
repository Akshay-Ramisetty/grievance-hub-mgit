import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Complaint, EmailOTP, ComplaintActivity

MGIT_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@mgit\.ac\.in$')
ROLL_NO_RE    = re.compile(r'^[a-zA-Z0-9]{10}$')


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'roll_number', 'email', 'branch', 'year', 'department', 'password', 'confirm_password']

    def validate_email(self, value):
        if not MGIT_EMAIL_RE.match(value):
            raise serializers.ValidationError('Must be a valid MGIT email (xxxxx@mgit.ac.in).')
        return value.lower()

    def validate_roll_number(self, value):
        if value and not ROLL_NO_RE.match(value):
            raise serializers.ValidationError('Roll number must be exactly 10 alphanumeric characters.')
        return value.upper()

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Accepts email OR roll_number + password."""
    email_or_roll = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'roll_number', 'email', 'branch', 'year', 'department', 'role', 'created_at']
        read_only_fields = ['id', 'role', 'created_at']


# ── Complaints ────────────────────────────────────────────────────────────────

class ComplaintActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.name', read_only=True)
    
    class Meta:
        model = ComplaintActivity
        fields = ['id', 'action', 'description', 'performed_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll_no = serializers.CharField(source='student.roll_number', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_department = serializers.CharField(source='student.department', read_only=True)
    activities = ComplaintActivitySerializer(many=True, read_only=True)
    resolution_time = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'complaint_id', 'title', 'category', 'description', 'status', 'priority',
            'assigned_department', 'remarks', 'attachment', 'is_anonymous',
            'block', 'floor', 'room_type', 'room_number', 'gender',
            'rating', 'feedback', 'resolved_at', 'resolution_time',
            'student_name', 'student_roll_no', 'student_email', 'student_department',
            'activities', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'complaint_id', 'status', 'assigned_department', 'remarks', 'resolved_at',
            'student_name', 'student_roll_no', 'student_email', 'student_department',
            'activities', 'resolution_time', 'created_at', 'updated_at',
        ]
    
    def get_resolution_time(self, obj):
        """Calculate resolution time in hours"""
        if obj.resolved_at:
            delta = obj.resolved_at - obj.created_at
            hours = delta.total_seconds() / 3600
            return round(hours, 1)
        return None


class ComplaintSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['title', 'category', 'description', 'attachment', 'priority', 'is_anonymous', 
                  'block', 'floor', 'room_type', 'room_number', 'gender']

    def validate_description(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError('Description must be at least 20 characters.')
        return value


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['pending', 'in-progress', 'resolved'])


class UpdatePrioritySerializer(serializers.Serializer):
    priority = serializers.ChoiceField(choices=['low', 'medium', 'high', 'urgent'])


class AssignDepartmentSerializer(serializers.Serializer):
    assigned_department = serializers.ChoiceField(choices=[
        'Academic Affairs', 'Student Services', 'Facilities Management',
        'IT Department', 'Hostel Administration', 'Library', 'Maintenance', 'Administration',
    ])


class AddRemarkSerializer(serializers.Serializer):
    remarks = serializers.CharField(min_length=1, max_length=2000)


class RateComplaintSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    feedback = serializers.CharField(required=False, allow_blank=True, max_length=1000)


# ── Email Verification ────────────────────────────────────────────────────────

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not MGIT_EMAIL_RE.match(value):
            raise serializers.ValidationError('Must be a valid MGIT email (xxxxx@mgit.ac.in).')
        return value.lower()

    def send_otp(self):
        email = self.validated_data['email']
        otp_code = EmailOTP.generate_otp()

        # Invalidate previous unused OTPs for this email
        EmailOTP.objects.filter(email=email, is_used=False).update(is_used=True)

        # Create new OTP record
        EmailOTP.objects.create(email=email, otp=otp_code)

        # Send email
        try:
            send_mail(
                subject='GrievanceHub - Email Verification OTP',
                message=(
                    f'Your OTP for email verification is: {otp_code}\n\n'
                    'This OTP will expire in 10 minutes.\n\n'
                    'If you did not request this, please ignore this email.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            raise serializers.ValidationError(f'Failed to send OTP: {str(e)}')


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs['email'].lower()
        otp = attrs['otp']

        try:
            otp_record = EmailOTP.objects.filter(
                email=email,
                otp=otp,
                is_used=False
            ).latest('created_at')

            if not otp_record.is_valid():
                raise serializers.ValidationError({'otp': 'OTP has expired. Please request a new one.'})

            attrs['otp_record'] = otp_record
        except EmailOTP.DoesNotExist:
            raise serializers.ValidationError({'otp': 'Invalid OTP.'})

        return attrs
