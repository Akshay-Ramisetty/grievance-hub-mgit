# Generated migration for location fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_complaint_feedback_complaint_is_anonymous_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='branch',
            field=models.CharField(blank=True, choices=[('CSE', 'Computer Science Engineering'), ('IT', 'Information Technology'), ('ECE', 'Electronics & Communication Engineering'), ('EEE', 'Electrical & Electronics Engineering'), ('MECH', 'Mechanical Engineering'), ('CIVIL', 'Civil Engineering'), ('CSB', 'Computer Science & Business Systems'), ('CSM', 'Computer Science & Mathematics'), ('CSD', 'Computer Science & Design'), ('MECHATRONICS', 'Mechatronics Engineering'), ('MME', 'Metallurgical & Materials Engineering')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='year',
            field=models.CharField(blank=True, choices=[('1', '1st Year'), ('2', '2nd Year'), ('3', '3rd Year'), ('4', '4th Year')], max_length=1, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='block',
            field=models.CharField(blank=True, choices=[('A', 'Block A'), ('B', 'Block B'), ('C', 'Block C'), ('D', 'Block D'), ('E', 'Block E'), ('F', 'Block F')], max_length=1, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='floor',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='room_type',
            field=models.CharField(blank=True, choices=[('classroom', 'Classroom'), ('lab', 'Lab'), ('washroom', 'Washroom'), ('staff_room', 'Staff Room')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='room_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='gender',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='complaint',
            name='category',
            field=models.CharField(choices=[('academics', 'Academics'), ('infrastructure', 'Infrastructure'), ('washroom', 'Washroom'), ('classroom', 'Classroom'), ('lab', 'Lab'), ('hostel', 'Hostel'), ('library', 'Library'), ('canteen', 'Canteen'), ('sports', 'Sports'), ('administration', 'Administration'), ('other', 'Other')], max_length=20),
        ),
    ]
