import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
function AuthGate() {
  const [token, setToken] = useState(() => localStorage.getItem("maatrishield-token"));
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      if (!token) { setReady(true); return; }
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${API}/api/profile`, { headers });
        if (!res.ok) throw new Error("Session expired");
        const profile = await res.json();
        if (profile) localStorage.setItem("maat rishield-profile", JSON.stringify(profile));
        else localStorage.removeItem("maat rishield-profile");
      } catch {
        localStorage.removeItem("maatrishield-token");
        localStorage.removeItem("maat rishield-profile");
        setToken(null);
      } finally { setReady(true); }
    }
    hydrate();
  }, [token]);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const res = await fetch(`${API}/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to continue. Please try again.");
      localStorage.setItem("maatrishield-token", data.access_token);
      localStorage.removeItem("maat rishield-profile");
      setToken(data.access_token);
    } catch (err) { setError(err.message || "Could not connect to the backend. Is the API running?"); }
    finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem("maatrishield-token"); localStorage.removeItem("maat rishield-profile"); setToken(null); setReady(true); }
  if (!ready) return <div className="auth-loading">Preparing your care space…</div>;
  if (token) return <><div className="session-bar"><span>Secure session</span><button onClick={logout}>Sign out</button></div><App /></>;
  return <div className="auth-shell">
    <section className="auth-art"><div className="auth-art-orbit one"/><div className="auth-art-orbit two"/><div className="auth-art-heart">♡</div><span className="auth-eyebrow">YOUR CARE, YOUR JOURNEY</span><h1>Every journey<br/>to motherhood<br/><em>deserves care.</em></h1><p>Gentle guidance for fertility, pregnancy and the days beyond.</p><div className="auth-trust">♡ &nbsp; Private by design &nbsp; · &nbsp; Care that follows you</div></section>
    <section className="auth-panel"><div className="auth-brand"><span>♡</span><div><strong>MaatriShield AI</strong><small>Healthy Women. Brighter Tomorrows.</small></div></div><span className="auth-eyebrow">WELCOME TO MAATRISHIELD</span><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p className="auth-subtitle">{mode === "login" ? "Sign in to continue to your personal care space." : "Create a secure account to start your care journey."}</p>
      <form onSubmit={submit} className="auth-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : 1} required/></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button></form>
      <p className="auth-switch">{mode === "login" ? "New to MaatriShield?" : "Already have an account?"} <button onClick={()=>{setMode(mode === "login" ? "register" : "login");setError("")}}>{mode === "login" ? "Create account" : "Sign in"}</button></p><div className="auth-privacy">♧ Your health details are sensitive. This is a prototype; use synthetic data only.</div>
    </section>
  </div>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><AuthGate /></React.StrictMode>);
