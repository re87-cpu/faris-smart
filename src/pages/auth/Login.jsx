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

      // استخدم http مع تمرير الهيدر مباشرة (لأن التوكن توه انحفظ)
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
    <div className="auth-page" dir="rtl">
      <div className="auth-shell">
        {/* البطاقة */}
        <section className="auth-card q-card">
          <div className="auth-brand">
            <div className="auth-logo" aria-label="شعار">
              <img src="/logo.png" alt="شعار واجهة الفارس الذكية" />
            </div>
            <div className="auth-title">واجهة الفارس الذكية</div>
            <div className="auth-subtitle">تسجيل الدخول</div>
          </div>

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            <div className="field">
              <label className="label">البريد الإلكتروني</label>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label className="label">كلمة المرور</label>
              <div className="input-with-action">
                <input
                  className="input"
                  type={show ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="q-btn ghost toggle"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            {err && <div className="error">{err}</div>}

            <div className="auth-row">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>تذكّرني</span>
              </label>

              <Link to="/register" className="auth-link">
                إنشاء حساب
              </Link>
            </div>

            <button className="q-btn primary submit" disabled={loading}>
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>

            <div className="auth-foot">
              لا تملك حساب موظف؟ <Link to="/register">إنشاء حساب</Link>
            </div>

            <div className="footnote">
              بدخولك، أنت توافق على شروط الاستخدام وسياسة الخصوصية.
            </div>
          </form>
        </section>

             {/* العمود الجانبي (مستجدات قانونية) */}
        <aside className="auth-aside">
          <div className="auth-aside-head">
            <div className="auth-aside-title">مستجدات قانونية</div>
            <div className="auth-aside-sub">
              آخر التحديثات والأنظمة واللوائح ذات الأثر القانوني.
            </div>
          </div>

          <div className="auth-news">
            <div className="auth-news-card">
              <div className="auth-dot" />
              <div>
                <div className="auth-news-title">صدور تعديل على نظام الإجراءات الجزائية</div>
                <div className="auth-news-desc">
                  تحديث عدد من المواد بما يؤثر على إجراءات التحقيق وسير الدعوى الجزائية.
                </div>
              </div>
            </div>

            <div className="auth-news-card">
              <div className="auth-dot" />
              <div>
                <div className="auth-news-title">لائحة تنفيذية جديدة لنظام الشركات</div>
                <div className="auth-news-desc">
                  تنظيم محدث للتأسيس والحوكمة ومسؤوليات الشركاء وفق الإطار النظامي.
                </div>
              </div>
            </div>

            <div className="auth-news-card">
              <div className="auth-dot" />
              <div>
                <div className="auth-news-title">تحديثات على نظام العمل</div>
                <div className="auth-news-desc">
                  إدخال بنود تنظيمية متعلقة بعقود العمل وحقوق أطراف العلاقة التعاقدية.
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
