import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
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

// داخل تطبيق Capacitor: الملفات تُقرأ محليًا من حزمة التطبيق، والخادم المحلي
// لا يُرجع تلقائيًا لـ index.html عند فتح مسار عميق (مثل /admin/cases/12) —
// فنستخدم HashRouter (روابط مثل #/admin/cases/12) التي تُحل دائمًا كملف واحد
// ثابت بدون أي إعداد خادم إضافي. الموقع على المتصفح يبقى BrowserRouter تمامًا
// كما كان — هذا الفرع لا يغيّر شيئًا في سلوك الموقع.
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
