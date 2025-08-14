import React from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import api from "../api";

export default function AddEmployee() {
  const navigate = useNavigate();

  const handleAdd = async (formData) => {
    try {
      await api.post("/employees/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/list");
    } catch (err) {
      console.error(err);
    }
  };

  return <EmployeeForm onSubmit={handleAdd} />;
}
