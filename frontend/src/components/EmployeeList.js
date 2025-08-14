import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import config from "../config";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees/");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}/`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Employee List</h2>
      <ul className="employee-list">
        {employees.map((emp) => (
          <li key={emp.id}>
            <span>
              {emp.name} - {emp.email} - {emp.designation} - {emp.salary}
            </span>
            {emp.profile_pic && (
              <img src={`${config.API_BASE_URL}${emp.profile_pic}`} alt="Profile" className="profile-pic" />
            )}
            <div>
              <Link to={`/edit/${emp.id}`}><button>Edit</button></Link>
              <button onClick={() => handleDelete(emp.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
