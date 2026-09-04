// FILE: src/pages/staff/StaffNotifications.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function StaffNotifications() {
  const me = getAuth()?.user || null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread
  const [updating, setUpdating] = useState(false);

  async function load() {
    if (!me) return;
    setLoading(true);
    setErr("");
    try {
      const unreadOnly = filter === "unread";
      const res = await fetchNotifications({ unreadOnly });
      const normalized = (res || []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        link: n.link || null,
        read: !!n.read,
        createdAtMs: n.createdAt ? new Date(n.createdAt).getTime() : 0,
      }));
      // الأحدث أولاً
      normalized.sort((a, b) => b.createdAtMs - a.createdAtMs);
      setRows(normalized);
    } catch (ex) {
      setErr(ex.message || "تعذّر تحميل الإشعارات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = rows.slice();
    if (s) {
      list = list.filter((n) =>
        [n.title, n.body].some((v) =>
          String(v || "").toLowerCase().includes(s)
        )
      );
    }
    return list;
  }, [rows, q]);

  async function onMarkOne(id) {
    try {
      setUpdating(true);
      await markNotificationRead(id);
      // نحدّث الحالة محليًا بدون إعادة تحميل كاملة
      setRows((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (ex) {
      setErr(ex.message || "تعذّر تحديث الإشعار.");
    } finally {
      setUpdating(false);
    }
  }

  async function onMarkAll() {
    try {
      setUpdating(true);
      await markAllNotificationsRead();
      // نحدّث محليًا
      setRows((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (ex) {
      setErr(ex.message || "تعذّر تحديد الكل كمقروء.");
    } finally {
      setUpdating(false);
    }
  }

  if (!me) {
    return (
      <div className="card elev-sm" style={{ padding: 16, border: "1px solid var(--color-neutral-300)" }} dir="rtl">
        الرجاء تسجيل الدخول.
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* شريط التحكم العلوي */}
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <b>الإشعارات</b>
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 170 }}>
              <option value="all">كل الإشعارات</option>
              <option value="unread">غير المقروءة فقط</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <input className="input" placeholder="بحث في العنوان/النص…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 220 }} />
            <button className="btn btn-ghost" onClick={load} disabled={loading}>تحديث</button>
            <button className="btn btn-primary" onClick={onMarkAll} disabled={updating || rows.every((n) => n.read)}>
              تحديد الكل كمقروء
            </button>
          </div>
        </div>
      </div>

      {err && <div style={{ color: "#b3261e", marginInlineStart: 2 }}>{err}</div>}

      {/* قائمة الإشعارات */}
      {loading ? (
        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>جارٍ التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", color: "var(--color-neutral-600)" }}>
          لا توجد إشعارات في هذا النطاق.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className="card elev-sm"
              style={{
                border: !n.read ? "1px solid var(--color-accent-500)" : "1px solid var(--color-neutral-300)",
                background: !n.read ? "var(--color-accent-100)" : "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!n.read && <span className="tag tag-accent">جديد</span>}
                  <b>{n.title || "بدون عنوان"}</b>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-neutral-600)", whiteSpace: "nowrap" }}>
                  {n.createdAtMs ? new Date(n.createdAtMs).toLocaleString() : "—"}
                </div>
              </div>

              <p style={{ margin: "4px 0 8px", fontSize: 14, color: "var(--color-neutral-700)", whiteSpace: "pre-wrap" }}>
                {n.body}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div>
                  {n.link && <a href={n.link}>فتح التفاصيل</a>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!n.read && (
                    <button className="btn btn-ghost" onClick={() => onMarkOne(n.id)} disabled={updating}>
                      تعليم كمقروء
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
