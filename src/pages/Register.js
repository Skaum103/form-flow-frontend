import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // 复用 Login.css 的样式

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

  
    try {
      const response = await fetch("http://你的后端接口/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Registration failed. Try another username.");
      }

      const data = await response.json();
      if (data.success) {
        alert("Registration successful! Please log in.");
        navigate("/login"); // 跳转到登录页
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" className="login-btn">
          Register
        </button>
        <div className="register-footer">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="register-link"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;