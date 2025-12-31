// FILE: src/pages/auth/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/api.js";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (password !== confirm) {
      return setErr("تأكيد كلمة المرور غير مطابق.");
    }

    if (!agree) {
      return setErr("فضلاً وافق على الشروط وسياسة الخصوصية.");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        full_name: name,
        email,
        password,
      });

      if (res?.status === "pending") {
        setOkMsg("تم إرسال طلب إنشاء الحساب. سيتم التفعيل بعد موافقة المدير.");
      } else {
        setOkMsg("تم إنشاء الحساب بنجاح.");
      }

      setTimeout(() => navigate("/login"), 1400);
    } catch (ex) {
      setErr(ex?.message || "تعذّر إنشاء الحساب.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-shell auth-shell--single">
        <section className="auth-card q-card">
          <div className="auth-brand">
            <div className="auth-logo">
              <img src="/logo.png" alt="شعار واجهة الفارس" />
            </div>
            <div className="auth-title">إنشاء حساب موظف</div>
            <div className="auth-subtitle">
              يتم تفعيل الحساب بعد اعتماد المدير
            </div>
          </div>

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            <div className="field">
              <label className="label">الاسم الكامل</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل"
                required
              />
            </div>

            <div className="field">
              <label className="label">البريد الإلكتروني</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label className="label">كلمة المرور</label>
              <div className="input-with-action">
                <input
                  className="input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label">تأكيد كلمة المرور</label>
              <div className="input-with-action">
                <input
                  className="input"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            <label className="check terms">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                أوافق على{" "}
                <a href="/terms" target="_blank" rel="noreferrer">
                  الشروط
                </a>{" "}
                و{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  سياسة الخصوصية
                </a>
              </span>
            </label>

            {err && <div className="error">{err}</div>}
            {okMsg && <div className="auth-ok">{okMsg}</div>}

            <button className="q-btn primary submit" disabled={loading}>
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
            </button>

            <div className="auth-foot">
              لديك حساب؟ <Link to="/login">تسجيل الدخول</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
