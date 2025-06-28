import React, { useState } from "react";
import { login, register, setToken, clearToken } from "./api";

// PUBLIC_INTERFACE
/**
 * Handles authentication views and actions: login, register, logout.
 * Props:
 *  - onAuth(token): called when authentication succeeds.
 */
export function Auth({ onAuth }) {
  const [mode, setMode] = useState("login"); // or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const data = await login(username, password);
        onAuth(data.access_token);
      } else {
        await register(username, password);
        setMode("login");
        setError("Registration successful, please log in.");
      }
    } catch (e) {
      setError(e.message || "Auth error");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  return (
    <div className="auth-container" style={{
      background: "var(--bg-secondary)",
      borderRadius: 8,
      margin: "60px auto",
      maxWidth: 350,
      padding: 32,
      boxShadow: "0 4px 18px rgba(0,0,0,0.09)"
    }}>
      <h2 style={{ marginBottom: 16 }}>{mode === "login" ? "Sign In" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          autoFocus
          placeholder="Username"
          style={{
            width: "100%", padding: 10, marginBottom: 12, borderRadius: 5,
            border: "1px solid var(--border-color)", fontSize: 16
          }}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          style={{
            width: "100%", padding: 10, marginBottom: 18, borderRadius: 5,
            border: "1px solid var(--border-color)", fontSize: 16
          }}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="theme-toggle"
          style={{
            width: "100%", marginBottom: 12,
            backgroundColor: "var(--button-bg)", color: "var(--button-text)", fontWeight: "bold"
          }}
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
        <button
          type="button"
          onClick={switchMode}
          className="App-link"
          style={{ width: "100%" }}
          tabIndex={-1}
        >
          {mode === "login" ? "Don't have an account? Register" : "Back to Login"}
        </button>
      </form>
      {error && <div style={{ color: "#e74c3c", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
