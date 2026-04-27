from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('me', views.me, name='me'),

    # Email Verification
    path('send-otp', views.send_otp, name='send_otp'),
    path('verify-otp', views.verify_otp, name='verify_otp'),

    # Complaints
    path('submit-complaint', views.submit_complaint, name='submit_complaint'),
    path('complaints', views.complaints_list, name='complaints_list'),
    path('complaint/<str:complaint_id>', views.complaint_detail, name='complaint_detail'),
    path('rate-complaint/<str:complaint_id>', views.rate_complaint, name='rate_complaint'),

    # Admin actions
    path('update-status/<str:complaint_id>', views.update_status, name='update_status'),
    path('update-priority/<str:complaint_id>', views.update_priority, name='update_priority'),
    path('assign-department/<str:complaint_id>', views.assign_department, name='assign_department'),
    path('add-remark/<str:complaint_id>', views.add_remark, name='add_remark'),
    path('admin/stats', views.admin_stats, name='admin_stats'),
]
