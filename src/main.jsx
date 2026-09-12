import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./App.css";
import "./styles/theme.css";
import "./styles/industry.css";
import "./styles/industry-arabic.css";
import "./styles/industry-auth.css";
import "./styles/industry-layout.css";
import "./styles/industry-grids.css";
import "./styles/industry-legacy-bridge.css";
import "./styles/site.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
