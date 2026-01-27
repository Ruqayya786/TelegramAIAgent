import React from "react";

interface Props {
  children: React.ReactNode;
  color: "green" | "red" | "orange";
  onClick: () => void;
}

const Button: React.FC<Props> = ({ children, color, onClick }) => {
  const bgColor =
    color === "green" ? "#4CAF50" :
    color === "red" ? "#F44336" :
    "#FF9800";

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        color: "white",
        border: "none",
        padding: "8px 16px",
        marginRight: "8px",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
};

export default Button; // ✅ default export
