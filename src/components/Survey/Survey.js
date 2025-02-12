import React from "react";
import { useNavigate } from "react-router-dom";

const Survey = ({ id, name, description, author, imageUrl }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/application/${id}`)}
      style={{
        cursor: "pointer",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        width: "250px"
      }}
    >
      <img src={imageUrl} alt={name} style={{ width: "100%", borderRadius: "8px" }} />
      <h3>{name}</h3>
      <p>{description}</p>
      <p><strong>作者:</strong> {author}</p>
    </div>
  );
};

export default Survey;
