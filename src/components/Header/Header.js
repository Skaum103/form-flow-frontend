import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("sessionToken");
    setUser(null);
    navigate("/");
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
            <li>
              {/* NavLink 可自动给当前激活的路由添加类名或内联样式 */}
              <NavLink
                to="/TakeSurvey"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Take Survey
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className="header-right">
        {user ? (
          <div className="user-dropdown">
            <span className="username">{user}</span>
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
