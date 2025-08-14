import React, { useState, useEffect } from 'react';
import axios from 'axios';

import config from './config';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [mode, setMode] = useState('home'); // 'home', 'add', 'edit'
  const [selectedEmp, setSelectedEmp] = useState(null);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${config.backendBaseUrl}${config.endpoints.employees}`
      );
      setEmployees(response.data);
    } catch (error) {
      alert('Failed to fetch employees');
      console.error(error);
    }
  };

  useEffect(() => {
    if (mode === 'home') {
      fetchEmployees();
      setSelectedEmp(null);
    }
  }, [mode]);

  const handleDelete = async empId => {
    if (!window.confirm('Are you sure to delete this employee?')) return;
    try {
      await axios.delete(
        `${config.backendBaseUrl}${config.endpoints.employees}${empId}/`
      );
      fetchEmployees();
    } catch (error) {
      alert('Failed to delete employee');
      console.error(error);
    }
  };

  const handleEdit = emp => {
    setSelectedEmp(emp);
    setMode('edit');
  };

  const handleAdd = () => {
    setSelectedEmp(null);
    setMode('add');
  };

  const handleSuccess = () => {
    setMode('home');
  };

  const handleCancel = () => {
    setMode('home');
  };

  return (
    <div style={{ maxWidth:"700px", margin:"auto", padding:"20px" }}>
      <h1>Employee Management</h1>

      {mode === 'home' && (
        <>
          <button onClick={handleAdd}>Add Employee</button>
          <button onClick={() => setMode('list')} style={{marginLeft:"10px"}}>Employee List</button>
          <EmployeeList
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {(mode === 'add' || mode === 'edit') && (
        <EmployeeForm
          employee={selectedEmp}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default App;