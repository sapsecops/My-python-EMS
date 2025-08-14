import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import api from "../api";

export default function EditEmployee() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}/`);
        setEmployee(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/employees/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/list");
    } catch (err) {
      console.error(err);
    }
  };

  if (!employee) return <p>Loading...</p>;

  return <EmployeeForm onSubmit={handleUpdate} initialData={employee} />;
}
