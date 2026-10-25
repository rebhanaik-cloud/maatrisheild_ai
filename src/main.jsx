import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import {
  authAPI,
  profileAPI,
  getStoredToken,
  setStoredToken,
  getStoredProfile,
  setStoredProfile,
  clearAuthSession,
} from "./api.js";

function AuthGate() {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Hydrate user session from backend on load
  const hydrate = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const me = await authAPI.getMe();
      setUser(me);
      if (me.profile) {
        setStoredProfile(me.profile);
      }
    } catch (err) {
      // If session is expired or invalid, reset
      clearAuthSession();
      setToken(null);
      setUser(null);
      if (err.status === 401) {
        setError("Your session has expired. Please sign in again.");
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    hydrate(token);
  }, [token, hydrate]);

  // Listen for 401 unauthorized events emitted from API client
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setError("Your session has expired. Please sign in again.");
    };
    window.addEventListener("maatrishield:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("maatrishield:unauthorized", handleUnauthorized);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setBusy(true);

    try {
      let data;
      if (mode === "login") {
        data = await authAPI.login(cleanEmail, password);
      } else {
        data = await authAPI.register(cleanEmail, password);
      }

      const newToken = data.access_token;
      setStoredToken(newToken);

      // Hydrate user profile right away
      try {
        const me = await authAPI.getMe();
        setUser(me);
        if (me.profile) {
          setStoredProfile(me.profile);
        } else {
          setStoredProfile(null);
        }
      } catch {
        // Fallback user object
        setUser({ email: cleanEmail });
      }

      setToken(newToken);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    setError("");
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="auth-loading">
        <div style={{ textAlign: "center", display: "grid", gap: "12px" }}>
          <div style={{ fontSize: "32px", animation: "pulse 1.5s infinite" }}>♡</div>
          <div>Preparing your care space…</div>
        </div>
      </div>
    );
  }

  if (token) {
    return (
      <>
        <div className="session-bar">
          <span>
            Care space active · <strong>{user?.email || "Signed in"}</strong>
          </span>
          <button onClick={handleLogout} title="Sign out of your session">
            Sign out
          </button>
        </div>
        <App user={user} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div className="auth-shell">
      <section className="auth-art">
        <div className="auth-art-orbit one" />
        <div className="auth-art-orbit two" />
        <div className="auth-art-heart">♡</div>
        <span className="auth-eyebrow">YOUR CARE, YOUR JOURNEY</span>
        <h1>
          Every journey
          <br />
          to motherhood
          <br />
          <em>deserves care.</em>
        </h1>
        <p>Gentle guidance for fertility, pregnancy, and the days beyond.</p>
        <div className="auth-trust">♡ &nbsp; Private by design &nbsp; · &nbsp; Care that follows you</div>
      </section>

      <section className="auth-panel">
        <div className="auth-brand">
          <span>♡</span>
          <div>
            <strong>MaatriShield AI</strong>
            <small>Healthy Women. Brighter Tomorrows.</small>
          </div>
        </div>

        <span className="auth-eyebrow">WELCOME TO MAATRISHIELD</span>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in with your email and password to continue to your personal care space."
            : "Create a secure account with your email and password to start your care journey."}
        </p>

        <form onSubmit={handleAuthSubmit} className="auth-form" noValidate={false}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={busy}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              required
              disabled={busy}
            />
          </label>

          {mode === "register" && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={busy}
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <span>→</span>
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New to MaatriShield?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        <div className="auth-privacy">
          ♧ Your health details are sensitive. This is a prototype application; please use synthetic data only.
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>
);
