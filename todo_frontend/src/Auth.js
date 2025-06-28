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
    <div
      className="auth-container"
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "1.1rem",
        margin: "70px auto",
        maxWidth: 360,
        padding: "38px 32px 32px 32px",
        boxShadow: "0 8px 36px rgba(25,118,210,0.13)",
        border: "1.5px solid var(--border-color)",
        textAlign: "center"
      }}>
      <h2 style={{
        marginBottom: 20,
        fontWeight: 700,
        fontSize: "2rem",
        color: "var(--primary)",
        letterSpacing: ".5px"
      }}>
        {mode === "login" ? "Sign In" : "Register"}
      </h2>
      <form onSubmit={handleSubmit} style={{width:"100%"}}>
        <input
          type="text"
          autoFocus
          required
          placeholder="Username"
          style={{
            width: "100%",
            marginBottom: 14,
            borderRadius: 8,
            fontSize: "1.11rem",
            fontWeight: 500
          }}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          style={{
            width: "100%",
            marginBottom: 18,
            borderRadius: 8,
            fontSize: "1.11rem",
            fontWeight: 500
          }}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="theme-toggle"
          style={{
            width: "100%",
            marginBottom: 13,
            background: "var(--button-bg)",
            fontWeight: "bold",
            fontSize: "1.05rem",
            letterSpacing: ".5px"
          }}
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
        <button
          type="button"
          onClick={switchMode}
          className="App-link"
          style={{
            width: "100%",
            color: "var(--accent)",
            textDecoration: "underline",
            fontWeight: 600,
            fontSize: "1.05rem"
          }}
          tabIndex={-1}
        >
          {mode === "login"
            ? "Don't have an account? Register"
            : "Back to Login"}
        </button>
      </form>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
