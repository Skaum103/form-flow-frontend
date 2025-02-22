import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 创建 x-www-form-urlencoded 格式的数据
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(baseUrl+"/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(), // 这里需要转成字符串
        credentials: "include",
      });

      const data = await response.json();
      
      if (!data.success) {
        const errorMessage = data.message && data.message.trim() !== "" ? data.message : "Login failed";
        console.log("Setting Error Message:", errorMessage);
        setErrorMsg(errorMessage);
      }
      
      
      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      if (data.success) {
        localStorage.setItem("sessionToken", data.sessionToken);
        localStorage.setItem("username", username);
        setUser(username); // 立即更新状态，让 Header 重新渲染
        navigate("/"); // 登录成功后跳转首页或别的页面
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // “注册”跳转
  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Log in</h2>
        {errorMsg && (
          <div role="alert" className="error-msg">
            {errorMsg}
          </div>
        )}
        <div className="form-group">
          <label>User Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Please enter your username"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Please enter your password"
            required
          />
        </div>
        <button type="submit" className="login-btn">
          Log in Now !
        </button>
        {/* 下面这个 div 专门放注册入口 */}
        <div className="register-footer">
          <span>Does not have an account?</span>
          <button
            type="button"
            onClick={handleRegisterClick}
            className="register-link"
          >
            Register Now
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
