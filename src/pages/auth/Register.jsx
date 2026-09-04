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

    if (password !== confirm) return setErr("تأكيد كلمة المرور غير مطابق.");
    if (!agree) return setErr("فضلاً وافق على الشروط وسياسة الخصوصية.");

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { full_name: name, email, password });
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
    <div dir="rtl" className="ind-authwrap">
      <aside className="ind-authside">
        <div className="ind-authside-body">
          <div className="ind-authside-kicker">
            <span className="ind-authside-rule" />
            <span>حساب موظف جديد</span>
          </div>
          <div className="ind-authside-title">طلبك يحتاج موافقة المدير قبل التفعيل.</div>
          <div className="ind-authside-sub">بعد إرسال الطلب سيتم إشعارك عند التفعيل.</div>
        </div>
      </aside>

      <div className="ind-authform">
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 className="ind-auth-h1">إنشاء حساب موظف</h1>

          <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label>الاسم الكامل</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سعد القحطاني" required />
            </div>

            <div className="field">
              <label>البريد الإلكتروني</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@faris-law.sa" autoComplete="username" required />
            </div>

            <div className="field">
              <label>كلمة المرور</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required style={{ flex: 1 }} />
                <button type="button" className="btn btn-ghost" onClick={() => setShowPass((v) => !v)}>{showPass ? "إخفاء" : "إظهار"}</button>
              </div>
            </div>

            <div className="field">
              <label>تأكيد كلمة المرور</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" required style={{ flex: 1 }} />
                <button type="button" className="btn btn-ghost" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? "إخفاء" : "إظهار"}</button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--color-neutral-700)" }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
              <span>
                أوافق على <a href="/terms" target="_blank" rel="noreferrer">الشروط</a> و <a href="/privacy" target="_blank" rel="noreferrer">سياسة الخصوصية</a>
              </span>
            </label>

            {err && (
              <div style={{ color: "#b3261e", fontSize: 13, background: "#fdecea", border: "1px solid #f6c6c2", borderRadius: "var(--radius)", padding: "8px 12px" }}>{err}</div>
            )}
            {okMsg && (
              <div style={{ color: "#1e7a45", fontSize: 13, background: "#edf7f0", border: "1px solid #bfe3cc", borderRadius: "var(--radius)", padding: "8px 12px" }}>{okMsg}</div>
            )}

            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--color-neutral-600)" }}>
              لديك حساب؟ <Link to="/login">تسجيل الدخول</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
