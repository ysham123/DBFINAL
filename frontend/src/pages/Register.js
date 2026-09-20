import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { Notice } from "../components/UI";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    password: "",
    confirmPassword: "",
    credit_card_last4: "",
    credit_card_type: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const change = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setLoading(true);
    const { confirmPassword, ...data } = form;
    const result = await register(data);
    if (result.success) navigate("/dashboard", { replace: true });
    else setError(result.error);
    setLoading(false);
  };
  const field = (name, label, type = "text", autoComplete, placeholder) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={type === "password" ? 6 : undefined}
        value={form[name]}
        onChange={change}
      />
    </div>
  );

  return (
    <AuthLayout wide>
      <h2>Create your account</h2>
      <p className="auth-intro">
        A few details, and you’re ready to book your first clean.
      </p>
      <Notice message={error} error />
      <form onSubmit={submit}>
        <div className="form-grid">
          {field(
            "first_name",
            "First name",
            "text",
            "given-name",
            "First name",
          )}
          {field("last_name", "Last name", "text", "family-name", "Last name")}
        </div>
        {field("email", "Email address", "email", "email", "you@example.com")}
        {field("phone_number", "Phone number", "tel", "tel", "(555) 123-4567")}
        {field(
          "address",
          "Home address",
          "text",
          "street-address",
          "Street address, city, state",
        )}
        <div className="form-grid">
          {field(
            "password",
            "Password",
            "password",
            "new-password",
            "At least 6 characters",
          )}
          {field(
            "confirmPassword",
            "Confirm password",
            "password",
            "new-password",
            "Repeat your password",
          )}
        </div>
        <details className="form-group">
          <summary>
            Payment reference <span className="service-meta">(optional)</span>
          </summary>
          <p className="form-note" style={{ marginTop: 10 }}>
            For your records only. No payment is taken.
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="credit_card_last4">Card’s last four digits</label>
              <input
                id="credit_card_last4"
                name="credit_card_last4"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={form.credit_card_last4}
                onChange={change}
                placeholder="1234"
              />
            </div>
            <div className="form-group">
              <label htmlFor="credit_card_type">Card type</label>
              <select
                id="credit_card_type"
                name="credit_card_type"
                value={form.credit_card_type}
                onChange={change}
              >
                <option value="">Select card type</option>
                <option>Visa</option>
                <option>Mastercard</option>
                <option value="Amex">American Express</option>
                <option>Discover</option>
              </select>
            </div>
          </div>
        </details>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?<Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
