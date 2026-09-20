import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { Notice } from "../components/UI";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success)
      navigate(result.client.isAdmin ? "/admin/dashboard" : "/dashboard", {
        replace: true,
      });
    else setError(result.error);
    setLoading(false);
  };

  return (
    <AuthLayout>
      <h2>Welcome back</h2>
      <p className="auth-intro">Sign in to manage your cleaning services.</p>
      <Notice message={error} error />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
          <ArrowRight size={16} />
        </button>
      </form>
      <p className="auth-switch">
        New here?<Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
