import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const isEdit = !!employee;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    salary: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        salary: employee.salary,
      });
    }
  }, [employee]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(
          `${config.backendBaseUrl}${config.endpoints.employees}${employee._id}/`,
          formData
        );
      } else {
        await axios.post(
          `${config.backendBaseUrl}${config.endpoints.employees}`,
          formData
        );
      }
      onSuccess();
    } catch (error) {
      alert('Error saving employee');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:"20px"}}>
      <div>
        <label>Name: </label>
        <input
          required
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          />
      </div>
      <div>
        <label>Email: </label>
        <input
          required
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          />
      </div>
      <div>
        <label>Designation: </label>
        <input
          required
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          />
      </div>
      <div>
        <label>Salary: </label>
        <input
          required
          type="number"
          step="0.01"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          />
      </div>
      <button type="submit">{isEdit ? 'Update' : 'Add'} Employee</button>
      <button type="button" onClick={onCancel} style={{marginLeft:"8px"}}>Cancel</button>
    </form>
  );
};

export default EmployeeForm;