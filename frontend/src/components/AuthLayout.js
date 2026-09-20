import React from "react";
import { Brand } from "./UI";

export default function AuthLayout({ children, wide = false }) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="eyebrow">A home, well cared for.</span>
          <h1>
            A clean home.
            <br />A clearer day.
          </h1>
          <p>
            Book your next clean, review your quotes, and keep track of the
            details. All in one place.
          </p>
        </div>
        <div className="auth-geometry" aria-hidden="true" />
        <p className="auth-footer">Anna’s Cleaning Services</p>
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
