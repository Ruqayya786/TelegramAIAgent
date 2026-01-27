import React, { useState } from "react";
import Button from "../components/Button"; 
import Card from "../components/Card"; 

interface Order {
  id: number;
  user: string;
  item: string;
  status: string;
}

interface Props {
  order: Order;
}

const OrderDetails: React.FC<Props> = ({ order }) => {
  const [status, setStatus] = useState(order.status);

  const handleChange = (newStatus: string) => {
    setStatus(newStatus);
    console.log(`Order ${order.id} is now ${newStatus}`);
    // TODO: Call backend API here
  };

  return (
    <Card>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>User:</strong> {order.user}</p>
      <p><strong>Item:</strong> {order.item}</p>
      <p><strong>Status:</strong> <span style={{ color: status === "Pending" ? "orange" : status === "Accepted" ? "green" : "red" }}>{status}</span></p>
      
      <Button color="green" onClick={() => handleChange("Accepted")}>Accept</Button>
      <Button color="red" onClick={() => handleChange("Rejected")}>Reject</Button>
      <Button color="orange" onClick={() => handleChange("Ready")}>Ready</Button>
    </Card>
  );
};

export default OrderDetails;
