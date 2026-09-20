import React, { useState } from "react";
import { brand } from "../branding";
import { Link } from "react-router-dom";
import { Home, Inbox, ArrowRight } from "lucide-react";

export function Brand() {
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <Link className="brand" to="/" aria-label={`${brand.name} home`}>
      {brand.logoUrl && !logoFailed ? (
        <img
          className="brand-logo"
          src={brand.logoUrl}
          alt=""
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span className="brand-mark">
          <Home size={21} />
        </span>
      )}
      <span>
        <span className="brand-name">{brand.name}</span>
        <span className="brand-description">{brand.tagline}</span>
      </span>
    </Link>
  );
}

export function PageHeader({ title, description, children, eyebrow }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  children,
}) {
  return (
    <div className="empty-state">
      <Inbox size={28} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

export function Notice({ message, error = false }) {
  if (!message) return null;
  return (
    <div
      className={`alert alert-${error ? "error" : "success"}`}
      role={error ? "alert" : "status"}
    >
      {message}
    </div>
  );
}

export function Table({ children }) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Scrollable records"
    >
      <table className="table">{children}</table>
    </div>
  );
}

export function Status({ value }) {
  return (
    <span className={`badge badge-${value}`}>
      {value?.replaceAll("_", " ")}
    </span>
  );
}

export function ViewLink({ to, children = "View all" }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowRight size={14} />
    </Link>
  );
}

export const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value || 0),
  );
export const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not scheduled";
