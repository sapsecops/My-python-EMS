import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import EmployeeList from "./components/EmployeeList";
import "./styles.css";

function App() {
  return (
    <Router>
      <div className="container">
        <h1>Employee Management</h1>
        <div className="button-group">
          <Link to="/add"><button>Add Employee</button></Link>
          <Link to="/list"><button>Employee List</button></Link>
        </div>

        <Routes>
          <Route path="/add" element={<AddEmployee />} />
          <Route path="/edit/:id" element={<EditEmployee />} />
          <Route path="/list" element={<EmployeeList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
