import React, { useState } from "react";

export default function EmployeeForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    designation: initialData.designation || "",
    salary: initialData.salary || "",
    profile_pic: null
  });

  const handleChange = (e) => {
    if (e.target.name === "profile_pic") {
      setFormData({ ...formData, profile_pic: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="text" name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} required />
      <input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} required />
      <input type="file" name="profile_pic" onChange={handleChange} accept="image/*" />
      <button type="submit">Submit</button>
    </form>
  );
}
