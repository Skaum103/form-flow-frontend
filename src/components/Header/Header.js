import React from "react";
import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  // 组件加载时，检查 localStorage 是否存有用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/login"); // 退出后跳转到登录页面
  };
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <span className="app-name">FormFlow</span>
        </div>
        <nav className="nav">
          <ul>
            <li>
              {/* NavLink 可自动给当前激活的路由添加类名或内联样式 */}
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/CreateApplication"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Create Application
              </NavLink>
            </li>
            {/* <li>
              <NavLink
                to="/my-answers"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                我的答题
              </NavLink>
            </li> */}
          </ul>
        </nav>
      </div>

      <div className="header-right">
        {username ? (
          <div className="user-dropdown">
            <span className="username">{username}</span>
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Log out</button>
            </div>
          </div>
        ) : (
          <Link to="/login">
            <button className="login-btn">Log In</button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
