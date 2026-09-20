import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { loadBrand } from "./branding";

const root = ReactDOM.createRoot(document.getElementById("root"));
loadBrand().then(() =>
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  ),
);
