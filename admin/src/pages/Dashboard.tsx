import React from "react";
import Orders from "./Orders";

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ color: "#333" }}>POS Dashboard</h1>
      <p style={{ color: "#555" }}>Welcome, Admin! Here are the latest orders:</p>
      <Orders />
    </div>
  );
};

export default Dashboard;
