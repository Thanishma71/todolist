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
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message); // already exists
        return;
      }

      alert("Registered successfully! Please login.");
      goToLogin();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2>Register</h2>

        <input
          style={input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button} onClick={handleRegister}>
          Register
        </button>

        <p style={link} onClick={goToLogin}>
          Already have account? Login
        </p>
      </div>
    </div>
  );
}

export default Register;
const container = {
  height: "100vh",
  background: "#0f172a",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const card = {
  background: "#1e293b",
  padding: "40px",
  borderRadius: "12px",
  width: "320px",
  textAlign: "center",
  color: "white",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none",
};

const button = {
  width: "100%",
  padding: "10px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const link = {
  marginTop: "10px",
  cursor: "pointer",
  color: "#3b82f6",
};
