// src/components/EmployeeList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const EmployeeList = ({ onEdit }) => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/employees`);
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees. Ensure backend is running.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`${config.API_URL}/employees/${id}`);
        fetchEmployees(); // Refresh the list
      } catch (err) {
        setError('Failed to delete employee.');
        console.error(err);
      }
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="employee-list">
      <h2>SapSecOps Employee List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.designation}</td>
              <td>${emp.salary.toLocaleString()}</td>
              <td className="actions">
                <button className="edit" onClick={() => onEdit(emp)}>Edit</button>
                <button className="delete" onClick={() => handleDelete(emp._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;