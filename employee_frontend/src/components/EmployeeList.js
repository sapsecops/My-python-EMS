import React from 'react';

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  if (!employees.length) return <p>No employees to display.</p>;

  return (
    <table border="1" cellPadding="8" cellSpacing="0" style={{width:"100%", maxWidth:"600px"}}>
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
        {employees.map(emp => (
          <tr key={emp._id || emp.id}>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>{emp.designation}</td>
            <td>{emp.salary}</td>
            <td>
              <button onClick={() => onEdit(emp)}>Edit</button>
              <button onClick={() => onDelete(emp._id || emp.id)} style={{marginLeft:"6px"}}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeList;