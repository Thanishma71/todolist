import React, { useState } from "react";

function Login({ setUser, goToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userId", data._id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("loginTime", Date.now());
        setUser(data._id);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-card { width: 100%; max-width: 380px; padding: 36px 28px; }
        @media (max-width: 400px) {
          .login-card { padding: 28px 18px; }
        }
        .login-input {
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 14px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #0f172a;
          color: white;
          font-size: 15px;
          colorScheme: dark;
          outline: none;
        }
        .login-input:focus { border-color: #3b82f6; }
        .login-btn {
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 15px;
          margin-top: 4px;
        }
        .login-btn:active { background: #2563eb; }
      `}</style>
      <div style={container}>
        <div className="login-card" style={card}>
          <div style={logo}>✅</div>
          <h2 style={title}>TaskFlow</h2>
          <p style={subtitle}>Sign in to your account</p>

          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoCapitalize="none"
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <p style={link} onClick={goToRegister}>
            New user? <span style={{ color: "#3b82f6" }}>Register</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;

const container = {
  minHeight: "100vh",
  background: "#0f172a",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
};
const card = {
  background: "#1e293b",
  borderRadius: "16px",
  textAlign: "center",
  color: "white",
  border: "1px solid #334155",
};
const logo = { fontSize: "40px", marginBottom: "8px" };
const title = { fontSize: "24px", fontWeight: "bold", marginBottom: "4px" };
const subtitle = { fontSize: "13px", color: "#94a3b8", marginBottom: "24px" };
const link = {
  marginTop: "18px",
  cursor: "pointer",
  color: "#94a3b8",
  fontSize: "14px",
};
