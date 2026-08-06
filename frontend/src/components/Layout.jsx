import React from "react";
import logo from "../assets/nuri-logo.png";

const Layout = ({ children, menuItems = [], onLogout }) => {
  return (
    <div className="layout">
      <header className="layout-header no-print">
        <div className="layout-header-left">
          <img src={logo} alt="누리도시락" className="app-logo" />
          <h1>누리도시락</h1>
          <nav className="layout-nav-inline">
            {menuItems.map((item) => (
              <a key={item.path} href={item.path}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <button onClick={onLogout}>로그아웃</button>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
};

export default Layout;