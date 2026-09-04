// FILE: src/pages/auth/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { setAuth } from "../../utils/auth.js";
import { http } from "../../utils/http.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const b1 = await http("POST", "/auth/login", { email, password });
      if (!b1?.token) {
        const code = b1?.error || b1?.message;
        if (code === "account_inactive" || code === "inactive") {
          throw new Error("حسابك غير مفعّل بعد. انتظر موافقة المدير على طلبك.");
        }
        if (code === "invalid_credentials") {
          throw new Error("بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.");
        }
        throw new Error(code || "تعذّر تسجيل الدخول.");
      }

      const token = b1.token;
      localStorage.setItem("faris_token", token);

      const me = await http("GET", "/me", null, { Authorization: `Bearer ${token}` });
      if (!me?.id) throw new Error(me?.error || "تعذّر جلب بيانات المستخدم بعد الدخول.");

      const role = me.role === "manager" ? "admin" : "staff";
      setAuth({ role, user: me, token });
      localStorage.setItem("user", JSON.stringify(me));

      if (remember) localStorage.setItem("auth_email", email);
      else localStorage.removeItem("auth_email");

      const from = location.state?.from;
      if (from) navigate(from, { replace: true });
      else navigate(me.role === "manager" ? "/dashboard-admin" : "/staff", { replace: true });
    } catch (ex) {
      setErr(ex?.message || "تعذّر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("auth_email");
    if (saved) setEmail(saved);
  }, []);

  return (
    <div dir="rtl" className="ind-authwrap">
      <aside className="ind-authside">
        <div className="ind-authside-body">
          <div className="ind-authside-title">إدارة القضايا بدقة، ومتابعتها بلا فوضى.</div>
          <div className="ind-authside-sub">
            بوابة موظفي ومدير شركة فارس محمد الغامدي للمحاماة.
          </div>
        </div>
      </aside>

      <div className="ind-authform">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h1 className="ind-auth-h1">تسجيل الدخول</h1>

          <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input
                className="input"
                type="email"
                placeholder="name@faris-law.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label>كلمة المرور</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-ghost" onClick={() => setShow((s) => !s)}>
                  {show ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            {err && (
              <div style={{ color: "#b3261e", fontSize: 13, background: "#fdecea", border: "1px solid #f6c6c2", borderRadius: "var(--radius)", padding: "8px 12px" }}>
                {err}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-neutral-700)" }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                تذكّرني
              </label>
              <Link to="/register" style={{ fontSize: 13 }}>إنشاء حساب</Link>
            </div>

            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--color-neutral-600)" }}>
              لا تملك حساب موظف؟ <Link to="/register">إنشاء حساب</Link>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-500)", textAlign: "center" }}>
              بدخولك، أنت توافق على شروط الاستخدام وسياسة الخصوصية.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
