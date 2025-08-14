from django.urls import path
from .views import EmployeeListCreateView, EmployeeDetailView

urlpatterns = [
    path("employees/", EmployeeListCreateView.as_view(), name="employee-list-create"),
    path("employees/<str:employee_id>/", EmployeeDetailView.as_view(), name="employee-detail"),
]
