import os
from bson import ObjectId
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from backend.config import get_db

COLLECTION = "employees"  # collection name

def _to_public(emp_doc):
    """Convert Mongo doc to API response shape."""
    if not emp_doc:
        return None
    emp = {
        "id": str(emp_doc.get("_id")) if emp_doc.get("_id") else None,
        "name": emp_doc.get("name"),
        "email": emp_doc.get("email"),
        "designation": emp_doc.get("designation"),
        "salary": emp_doc.get("salary"),
        "profile_pic": emp_doc.get("profile_pic"),  # already stores /media/... path
    }
    return emp

def _store_profile_pic(file_obj):
    if not file_obj:
        return None
    fs = FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)
    saved_name = fs.save(f"profile_pics/{file_obj.name}", file_obj)
    # Return URL path (e.g., /media/profile_pics/abc.jpg)
    return f"{settings.MEDIA_URL}{saved_name}".replace("//", "/")

def _remove_profile_pic(url_path):
    if not url_path:
        return
    # url_path like "/media/profile_pics/xxx.jpg" -> turn into actual file path
    if url_path.startswith(settings.MEDIA_URL):
        rel = url_path[len(settings.MEDIA_URL):]
    else:
        rel = url_path.lstrip("/")
    file_path = os.path.join(settings.MEDIA_ROOT, rel)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

class EmployeeListCreateView(APIView):
    """
    GET /api/employees/  -> list
    POST /api/employees/ -> create (multipart/form-data), fields: name, email, designation, salary, profile_pic
    """
    def get(self, request):
        db = get_db()
        docs = list(db[COLLECTION].find().sort("_id", -1))
        return Response([_to_public(d) for d in docs], status=status.HTTP_200_OK)

    def post(self, request):
        db = get_db()
        name = request.data.get("name")
        email = request.data.get("email")
        designation = request.data.get("designation")
        salary = request.data.get("salary")
        profile_file = request.FILES.get("profile_pic")

        if not all([name, email, designation, salary]):
            return Response({"detail": "All fields (name, email, designation, salary) are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Enforce unique email
        if db[COLLECTION].find_one({"email": email}):
            return Response({"detail": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            salary_val = float(salary)
        except Exception:
            return Response({"detail": "Salary must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        profile_pic_url = _store_profile_pic(profile_file) if profile_file else None

        doc = {
            "name": name,
            "email": email,
            "designation": designation,
            "salary": salary_val,
            "profile_pic": profile_pic_url,
        }
        inserted = db[COLLECTION].insert_one(doc)
        new_doc = db[COLLECTION].find_one({"_id": inserted.inserted_id})
        return Response(_to_public(new_doc), status=status.HTTP_201_CREATED)

class EmployeeDetailView(APIView):
    """
    GET /api/employees/<id>/
    PUT /api/employees/<id>/   (multipart/form-data accepted; same fields)
    DELETE /api/employees/<id>/
    """
    def get(self, request, employee_id):
        db = get_db()
        try:
            oid = ObjectId(employee_id)
        except Exception:
            return Response({"detail": "Invalid ID"}, status=status.HTTP_400_BAD_REQUEST)

        doc = db[COLLECTION].find_one({"_id": oid})
        if not doc:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(_to_public(doc), status=status.HTTP_200_OK)

    def put(self, request, employee_id):
        db = get_db()
        try:
            oid = ObjectId(employee_id)
        except Exception:
            return Response({"detail": "Invalid ID"}, status=status.HTTP_400_BAD_REQUEST)

        doc = db[COLLECTION].find_one({"_id": oid})
        if not doc:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("name", doc.get("name"))
        email = request.data.get("email", doc.get("email"))
        designation = request.data.get("designation", doc.get("designation"))
        salary = request.data.get("salary", doc.get("salary"))
        profile_file = request.FILES.get("profile_pic")

        # Unique email check (if changed)
        if email and email != doc.get("email"):
            if db[COLLECTION].find_one({"email": email, "_id": {"$ne": oid}}):
                return Response({"detail": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Parse salary
        try:
            salary_val = float(salary) if salary is not None else None
        except Exception:
            return Response({"detail": "Salary must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        update = {
            "name": name,
            "email": email,
            "designation": designation,
            "salary": salary_val,
        }

        # Handle profile pic replacement if a new file is provided
        if profile_file:
            # remove old
            if doc.get("profile_pic"):
                _remove_profile_pic(doc["profile_pic"])
            new_url = _store_profile_pic(profile_file)
            update["profile_pic"] = new_url

        db[COLLECTION].update_one({"_id": oid}, {"$set": update})
        updated = db[COLLECTION].find_one({"_id": oid})
        return Response(_to_public(updated), status=status.HTTP_200_OK)

    def delete(self, request, employee_id):
        db = get_db()
        try:
            oid = ObjectId(employee_id)
        except Exception:
            return Response({"detail": "Invalid ID"}, status=status.HTTP_400_BAD_REQUEST)

        doc = db[COLLECTION].find_one({"_id": oid})
        if not doc:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # Delete file if exists
        if doc.get("profile_pic"):
            _remove_profile_pic(doc["profile_pic"])

        db[COLLECTION].delete_one({"_id": oid})
        return Response(status=status.HTTP_204_NO_CONTENT)
