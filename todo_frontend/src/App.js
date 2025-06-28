import React, { useState, useEffect } from "react";
import "./App.css";
import { Auth } from "./Auth";
import { TodoApp } from "./TodoApp";
import { setToken } from "./api";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [token, setTokenState] = useState(null);

  // Load theme preference and token from storage if present
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("jwt_token");
    if (storedToken) {
      setToken(storedToken);
      setTokenState(storedToken);
    }
    // For theme persistence
    const storedTheme = window.localStorage.getItem("ui_theme");
    if (storedTheme) setTheme(storedTheme);
  }, []);

  // Save theme preference
  useEffect(() => {
    window.localStorage.setItem("ui_theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  function handleAuthSuccess(newToken) {
    setToken(newToken);
    setTokenState(newToken);
    window.localStorage.setItem("jwt_token", newToken);
  }

  function handleLogoutGlobal() {
    setTokenState(null);
    window.localStorage.removeItem("jwt_token");
    window.location.reload();
  }

  return (
    <div className="App">
      <button
        className="theme-toggle"
        style={{ zIndex: 9, position: "absolute", top: 18, right: 18 }}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      {!token ? (
        <Auth onAuth={handleAuthSuccess} />
      ) : (
        <TodoApp onLogout={handleLogoutGlobal} />
      )}
    </div>
  );
}

export default App;
