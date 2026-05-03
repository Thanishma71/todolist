import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(localStorage.getItem("userId"));
  const [showRegister, setShowRegister] = useState(false);

  if (user) {
    return <Dashboard setUser={setUser} />;
  }

  return showRegister ? (
    <Register setUser={setUser} goToLogin={() => setShowRegister(false)} />
  ) : (
    <Login setUser={setUser} goToRegister={() => setShowRegister(true)} />
  );
}

export default App;
