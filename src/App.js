import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header'; 
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import CreateApplication from './pages/CreateApplication';
import Login from './pages/Login';
import Register from './pages/Register';
function App() {
  return (
    <Router>
      <Header />
      <div style={{ marginTop: '60px', padding: '16px' }}>
        {/* 使用 <Routes> 包裹所有路由 */}
        <Routes>
          {/* 使用 element 属性传入要渲染的组件 */}
          <Route path="/" element={<Home />} />
          <Route path="/CreateApplication" element={<CreateApplication />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
