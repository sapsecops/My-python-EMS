from djongo import models

class Employee(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    designation = models.CharField(max_length=255)
    salary = models.FloatField()
    profile_pic = models.ImageField(upload_to='profile_pics/')

    def __str__(self):
        return self.name
