// src/components/AddEmployee.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AddEmployee = ({ employeeToEdit, onFinished }) => {
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    designation: '',
    salary: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setEmployee(employeeToEdit);
      setIsEditing(true);
    }
  }, [employeeToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${config.API_URL}/employees/${employee._id}`, employee);
      } else {
        await axios.post(`${config.API_URL}/employees`, employee);
      }
      onFinished(); // Go back to the employee list after submission
    } catch (err) {
      console.error('Failed to save employee', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <h2>{isEditing ? 'Edit Employee' : 'Add SapSecOps Employee'}</h2>
      <input name="name" value={employee.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={employee.email} onChange={handleChange} placeholder="Email" type="email" required />
      <input name="designation" value={employee.designation} onChange={handleChange} placeholder="Designation" required />
      <input name="salary" value={employee.salary} onChange={handleChange} placeholder="Salary" type="number" required />
      <button type="submit">{isEditing ? 'Update' : 'Add'} Employee</button>
    </form>
  );
};

export default AddEmployee;