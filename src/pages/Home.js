import React, { useEffect, useState } from "react";
import Survey from "../components/Survey/Survey";

const Home = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetch("/api/applications", { credentials: "include" })
      .then(res => res.json())
      .then(data => setApps([...data.userApps, ...data.presetApps]));
  }, []);

  return (
    <div>
      <h1>发现应用</h1>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        padding: "20px"
      }}>
        {apps.map(app => (
          <Survey 
            key={app.id} 
            id={app.id} 
            name={app.name} 
            description={app.description} 
            author={app.author} 
            imageUrl={app.imageUrl} 
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
