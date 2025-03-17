import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import CreateApplication from "./pages/CreateApplication";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import QuestionPage from "./pages/QuestionPage";
import ApplicationDetail from "./pages/ApplicationDetail";
import TakeSurvey from "./pages/TakeSurvey";
// import QuestionPage from "./pages/QuestionPage";
function App() {
  //如果用户是第一次访问，user = null（未登录）。如果用户之前登录过（刷新页面后），user 会从 localStorage 里恢复，不会丢失登录状态
  const [user, setUser] = useState(localStorage.getItem("username") || null);

  //useEffect 监听 localStorage 并恢复 user 状态
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <Header user={user} setUser={setUser} />
      <div style={{ marginTop: "60px", padding: "16px" }}>
        {/* 使用 <Routes> 包裹所有路由 */}
        <Routes>
          {/* 使用 element 属性传入要渲染的组件 */}
          <Route path="/" element={<Home />} />
          <Route path="/survey/:surveyId" element={<ApplicationDetail />} />
          <Route path="/CreateApplication" element={<CreateApplication />} />
          <Route path="/TakeSurvey" element={<TakeSurvey />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
