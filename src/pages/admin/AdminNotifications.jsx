// FILE: src/pages/admin/AdminNotifications.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function AdminNotifications() {
  const me = getAuth()?.user || null;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);

  async function load() {
    if (!me) return;
    setLoading(true);
    setErr("");
    try {
      const list = await fetchNotifications({ unreadOnly });
      const normalized = (list || []).map((n) => ({
        id: n.id, title: n.title || "إشعار", body: n.body || "", link: n.link || "",
        read: !!(n.read ?? n.is_read ?? false), createdAt: n.createdAt || n.created_at || null,
      }));
      setRows(normalized);
    } catch (e) {
      setErr(e.message || "تعذّر تحميل الإشعارات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [me?.id, unreadOnly]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let arr = rows.slice();
    if (s) arr = arr.filter((n) => [n.title, n.body, n.id].some((v) => String(v || "").toLowerCase().includes(s)));
    return arr;
  }, [rows, q]);

  const unreadCount = useMemo(() => rows.filter((x) => !x.read).length, [rows]);

  async function onReadOne(n) {
    setErr("");
    try { setBusy(n.id); await markNotificationRead(n.id); await load(); }
    catch (e) { setErr(e.message || "تعذّر تعليم الإشعار كمقروء."); }
    finally { setBusy(null); }
  }

  async function onReadAll() {
    setErr("");
    try { setBusy("all"); await markAllNotificationsRead(); await load(); }
    catch (e) { setErr(e.message || "تعذّر تعليم الكل كمقروء."); }
    finally { setBusy(null); }
  }

  if (!me) return <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }} dir="rtl">الرجاء تسجيل الدخول.</div>;

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <b>إشعارات المدير</b>
            <span style={{ color: "var(--color-neutral-600)", fontSize: 13 }}>غير مقروء: {unreadCount}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input className="input" placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} />
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
              غير المقروء فقط
            </label>
            <button className="btn btn-ghost" onClick={load} disabled={loading}>تحديث</button>
            <button className="btn btn-primary" onClick={onReadAll} disabled={busy === "all" || unreadCount === 0}>
              {busy === "all" ? "جارٍ التنفيذ…" : "تعليم الكل كمقروء"}
            </button>
          </div>
        </div>
      </div>

      {err && <div style={{ color: "#b3261e" }}>{err}</div>}

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--color-neutral-600)" }}>لا توجد إشعارات.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((n) => {
              const isBusy = busy === n.id;
              return (
                <div key={n.id} className="card elev-sm" style={{ border: !n.read ? "1px solid var(--color-accent-500)" : "1px solid var(--color-neutral-300)", background: !n.read ? "var(--color-accent-100)" : "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <b>{n.title}</b>
                        {!n.read && <span className="tag tag-accent">جديد</span>}
                      </div>
                      {n.body && <div style={{ color: "var(--color-neutral-700)", lineHeight: 1.7 }}>{n.body}</div>}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{n.createdAt ? new Date(n.createdAt).toLocaleString("ar-SA") : "—"}</span>
                        {n.link && <a className="btn btn-ghost" href={n.link}>فتح الرابط</a>}
                      </div>
                    </div>
                    {!n.read && <button className="btn btn-ghost" onClick={() => onReadOne(n)} disabled={isBusy}>{isBusy ? "…" : "تعليم كمقروء"}</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
