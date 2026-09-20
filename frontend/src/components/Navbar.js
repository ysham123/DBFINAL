import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  FileText,
  CalendarDays,
  Receipt,
  LayoutDashboard,
} from "lucide-react";
import { Brand } from "./UI";

export default function Navbar() {
  const { user, logout, isAnna } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const links = [
    [isAnna ? "/anna/dashboard" : "/dashboard", "Overview", LayoutDashboard],
    [isAnna ? "/anna/requests" : "/my-requests", "Requests", FileText],
    [isAnna ? "/anna/orders" : "/my-orders", "Orders", CalendarDays],
    [isAnna ? "/anna/bills" : "/my-bills", "Billing", Receipt],
  ];
  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <Brand />
      <p className="nav-label">{isAnna ? "Workspace" : "Client portal"}</p>
      <nav aria-label="Main navigation">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link${isActive || (label === "Requests" && pathname.includes("request")) || (label === "Orders" && pathname.includes("order")) || (label === "Billing" && pathname.includes("bill")) ? " active" : ""}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        className="icon-button mobile-signout"
        onClick={signOut}
        aria-label="Sign out"
      >
        <LogOut size={18} />
      </button>
      <div className="sidebar-bottom">
        <div className="workspace-note">
          <strong>
            {isAnna ? "Your daily workspace" : "A little less on your list."}
          </strong>
          <p>
            {isAnna
              ? "Manage requests, schedules, and billing in one place."
              : "Your next clean is a request away."}
          </p>
        </div>
        <div className="user-block">
          <div className="avatar" aria-hidden="true">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div>
            <p className="user-name">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="user-role">
              {isAnna ? "Administrator" : "Personal account"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="icon-button"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
