// // src/components/Header/Header.js

// import React from 'react';
// import { Link } from 'react-router-dom';
// import './Header.css';

// function Header() {
//   return (
//     <header className="header">
//       <div className="header-left">
//         {/* Logo + 标题区域 */}
//         <div className="logo">
//           <img src="/logo.png" alt="Logo" />
//           <span className="app-name">FormFlow</span>
//         </div>
//         {/* 导航区域 */}
//         <nav className="nav">
//           <ul>
//             <li>
//               <Link to="/">Home</Link>
//             </li>
//             <li>
//               <Link to="/CreateApplication">Create Application</Link>
//             </li>
//           </ul>
//         </nav>
//       </div>

//       <div className="header-right">
//         <button>Login In</button>
//       </div>
//     </header>
//   );
// }

// export default Header;
// src/components/Header/Header.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

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
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/CreateApplication"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
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
        <button>Login In</button>
      </div>
    </header>
  );
}

export default Header;
