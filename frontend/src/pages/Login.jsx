import React, { useState } from "react";
import { login } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import logo from "../assets/nuri-logo.png";

const Login = ({ onLoginSuccess }) => {
  const showToast = useToast();
  const companyCode = new URLSearchParams(window.location.search).get("c"); // ?c=C0001
  const [loginId, setLoginId] = useState(companyCode ? "user" : "");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(companyCode, loginId, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      onLoginSuccess();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <form className="login-page" onSubmit={handleLogin}>
      <div className="login-title-row">
        <img src={logo} alt="누리도시락" className="login-logo" />
        <h1>누리도시락</h1>
      </div>
      {!companyCode && (
        <input placeholder="아이디" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
      )}
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
    </form>
  );
};

export default Login;