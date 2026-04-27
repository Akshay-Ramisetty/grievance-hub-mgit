from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    """Allow access only to authenticated students."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')


class IsAdmin(BasePermission):
    """Allow access only to authenticated admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsAdminOrOwner(BasePermission):
    """Admins can access any complaint; students only their own."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.student == request.user
