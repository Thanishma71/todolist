import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(localStorage.getItem("userId"));
  const [page, setPage] = useState("login");

  // ── Check if session expired on page refresh ──
  useEffect(() => {
    const loginTime = localStorage.getItem("loginTime");
    const SESSION_LIMIT = 15 * 60 * 1000; // 15 minutes

    if (loginTime && Date.now() - Number(loginTime) > SESSION_LIMIT) {
      // Session expired — force logout
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("loginTime");
      setUser(null);
      alert("Your session has expired. Please login again.");
    }
  }, []);

  if (user) {
    return <Dashboard setUser={setUser} />;
  }

  if (page === "register") {
    return <Register goToLogin={() => setPage("login")} />;
  }

  return <Login setUser={setUser} goToRegister={() => setPage("register")} />;
}

export default App;
