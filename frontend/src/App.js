import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import CompanyPage from "./pages/CompanyPage";
import MenuPage from "./pages/MenuPage";
import OrderApplyPage from "./pages/OrderApplyPage";
import OrderManagePage from "./pages/OrderManagePage";
import StatisticsPage from "./pages/StatisticsPage";
import SettlementPage from "./pages/SettlementPage";
import CodePage from "./pages/CodePage";
import { decodeToken } from "./utils/jwt";

const MENU_ITEMS = [
  { path: "#company", label: "업체관리", element: <CompanyPage />, roles: ["admin"] },
  { path: "#menu", label: "식단관리", element: <MenuPage />, roles: ["admin"] },
  { path: "#order-apply", label: "식수신청", element: <OrderApplyPage />, roles: ["company"] },
  { path: "#order-manage", label: "식수관리", element: <OrderManagePage />, roles: ["admin"] },
  { path: "#stats", label: "통계관리", element: <StatisticsPage />, roles: ["admin"] },
  { path: "#settlement", label: "정산관리", element: <SettlementPage />, roles: ["admin"] },
  { path: "#code", label: "공통코드", element: <CodePage />, roles: ["admin"] },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && isLoggedIn) {
      const decoded = decodeToken(token);
      setRole(decoded?.role || null);
    } else {
      setRole(null);
    }
  }, [isLoggedIn]);

  const visibleMenuItems = MENU_ITEMS.filter((m) => role && m.roles.includes(role));

  useEffect(() => {
    if (visibleMenuItems.length === 0) return;
    const validPaths = visibleMenuItems.map((m) => m.path);
    const currentHash = window.location.hash;
    if (validPaths.includes(currentHash)) {
      setCurrentPage(currentHash);
    } else {
      window.location.hash = visibleMenuItems[0].path;
      setCurrentPage(visibleMenuItems[0].path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    const handler = () => setCurrentPage(window.location.hash || null);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.hash = "";
    setIsLoggedIn(false);
    setCurrentPage(null);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (!role || visibleMenuItems.length === 0) {
    return <div style={{ padding: "2rem" }}>메뉴 권한을 확인하는 중입니다...</div>;
  }

  const active =
    visibleMenuItems.find((m) => m.path === currentPage) || visibleMenuItems[0];

  return (
    <Layout menuItems={visibleMenuItems} onLogout={handleLogout}>
      {active.element}
    </Layout>
  );
}

export default App;