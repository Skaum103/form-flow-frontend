import React from "react";
import { NavLink } from "react-router-dom";
import { Link } from 'react-router-dom';
import "./Header.css";

function Header() {
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
        <Link to="/login">
          <button>Log In</button>
        </Link>
      </div>
    </header>
  );
}

export default Header;
