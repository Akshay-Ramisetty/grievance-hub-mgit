from django.core.management.base import BaseCommand
from api.models import User


class Command(BaseCommand):
    help = 'Create a default admin user for development'

    def handle(self, *args, **options):
        email = 'admin@mgit.ac.in'
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin {email} already exists.'))
            return

        User.objects.create_superuser(
            email=email,
            password='akshaynaidu88',
            name='MGIT Admin',
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(
            f'Admin created — email: {email}  password: Admin@1234'
        ))
