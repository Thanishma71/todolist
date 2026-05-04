import React, { useState } from "react";

function Register({ goToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert("Registered successfully! Please login.");
        goToLogin();
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
        .reg-card { width: 100%; max-width: 380px; padding: 36px 28px; }
        @media (max-width: 400px) {
          .reg-card { padding: 28px 18px; }
        }
        .reg-input {
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 14px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #0f172a;
          color: white;
          font-size: 15px;
          outline: none;
        }
        .reg-input:focus { border-color: #3b82f6; }
        .reg-btn {
          width: 100%;
          padding: 12px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 15px;
          margin-top: 4px;
        }
        .reg-btn:active { background: #16a34a; }
      `}</style>
      <div style={container}>
        <div className="reg-card" style={card}>
          <div style={logo}>📝</div>
          <h2 style={title}>Create Account</h2>
          <p style={subtitle}>Join TaskFlow today</p>

          <input
            className="reg-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            autoCapitalize="none"
          />
          <input
            className="reg-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />

          <button className="reg-btn" onClick={handleRegister}>
            Register
          </button>

          <p style={link} onClick={goToLogin}>
            Already have an account?{" "}
            <span style={{ color: "#3b82f6" }}>Login</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;

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
