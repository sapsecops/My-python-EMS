import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate("/add")}>Add Employee</button>
      <button onClick={() => navigate("/list")}>Employee List</button>
    </div>
  );
}
