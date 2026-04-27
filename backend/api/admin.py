from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Complaint


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'roll_number', 'role', 'department', 'is_active']
    list_filter = ['role', 'is_active', 'department']
    search_fields = ['email', 'name', 'roll_number']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'roll_number', 'department')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'roll_number', 'department', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['complaint_id', 'title', 'student', 'category', 'status', 'assigned_department', 'created_at']
    list_filter = ['status', 'category', 'assigned_department']
    search_fields = ['complaint_id', 'title', 'student__name', 'student__roll_number']
    readonly_fields = ['complaint_id', 'created_at', 'updated_at']
    ordering = ['-created_at']
