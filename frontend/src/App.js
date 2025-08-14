// src/App.js
import React, { useState } from 'react';
import EmployeeList from './components/EmployeeList';
import AddEmployee from './components/AddEmployee';
import './App.css';

function App() {
  const [view, setView] = useState('home'); // 'home', 'list', 'add'
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setView('add');
  };

  const showHomePage = () => {
    setView('home');
    setCurrentEmployee(null);
  };
  
  const showListPage = () => {
    setView('list');
    setCurrentEmployee(null);
  }

  const showAddPage = () => {
    setView('add');
    setCurrentEmployee(null);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Employee Management System</h1>
        <nav>
          <button onClick={showHomePage} disabled={view === 'home'}>Home</button>
        </nav>
      </header>
      <main>
        {view === 'home' && (
          <div className="home-buttons">
            <button onClick={showAddPage}>Add Employee</button>
            <button onClick={showListPage}>Employee List</button>
          </div>
        )}
        {view === 'list' && <EmployeeList onEdit={handleEdit} />}
        {view === 'add' && <AddEmployee employeeToEdit={currentEmployee} onFinished={showListPage} />}
      </main>
    </div>
  );
}

export default App;