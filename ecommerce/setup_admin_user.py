import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin():
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser created: {username} / {password}")
    else:
        print(f"Superuser {username} already exists")

if __name__ == '__main__':
    create_admin()
