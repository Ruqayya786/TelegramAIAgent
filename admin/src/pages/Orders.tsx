import React from "react";
import OrderDetails from "./OrderDetails";

const orders = [
  { id: 1, user: "Ali", item: "Margherita Pizza", status: "Pending" },
  { id: 2, user: "Sara", item: "Chicken Burger", status: "Pending" },
  { id: 3, user: "Ahmed", item: "French Fries", status: "Pending" },
];

const Orders: React.FC = () => {
  return (
    <div>
      {orders.map(order => (
        <OrderDetails key={order.id} order={order} />
      ))}
    </div>
  );
};

export default Orders;
