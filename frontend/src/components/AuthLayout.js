import React from "react";
import { Brand } from "./UI";
import { brand } from "../branding";

export default function AuthLayout({ children, wide = false }) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="eyebrow">{brand.tagline}</span>
          <h1 style={{ whiteSpace: "pre-line" }}>{brand.headline}</h1>
          <p>{brand.description}</p>
        </div>
        <div className="auth-geometry" aria-hidden="true" />
        <p className="auth-footer">{brand.name}</p>
      </aside>
      <main className="auth-main">
        <div className={`auth-form${wide ? " auth-form-wide" : ""}`}>
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
