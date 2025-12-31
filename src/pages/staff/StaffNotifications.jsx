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
      <div className="q-card" style={{ padding: 16 }} dir="rtl">
        الرجاء تسجيل الدخول.
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12, padding: "16px 0" }}>
      {/* شريط التحكم العلوي */}
      <section className="q-card" style={{ padding: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <b>الإشعارات</b>
            <select
              className="input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">كل الإشعارات</option>
              <option value="unread">غير المقروءة فقط</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <input
              className="input"
              placeholder="بحث في العنوان/النص…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 220 }}
            />
            <button className="q-btn ghost" onClick={load} disabled={loading}>
              تحديث
            </button>
            <button
              className="q-btn primary"
              onClick={onMarkAll}
              disabled={updating || rows.every((n) => n.read)}
            >
              تحديد الكل كمقروء
            </button>
          </div>
        </div>
      </section>

      {err && (
        <div className="error" style={{ marginInlineStart: 2 }}>
          {err}
        </div>
      )}

      {/* قائمة الإشعارات */}
      <section className="q-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "var(--ink-600)" }}>
            لا توجد إشعارات في هذا النطاق.
          </div>
        ) : (
          <div style={{ padding: 8, display: "grid", gap: 8 }}>
            {filtered.map((n) => (
              <article
                key={n.id}
                className="q-card"
                style={{
                  padding: 10,
                  border:
                    n.read === false
                      ? "1px solid var(--accent-soft, #bfdbfe)"
                      : "1px solid var(--border)",
                  backgroundColor:
                    n.read === false ? "rgba(191, 219, 254, 0.20)" : "white",
                }}
              >
                <header
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {!n.read && (
                      <span className="badge" style={{ fontSize: 11 }}>
                        جديد
                      </span>
                    )}
                    <b>{n.title || "بدون عنوان"}</b>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-500)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.createdAtMs
                      ? new Date(n.createdAtMs).toLocaleString()
                      : "—"}
                  </div>
                </header>

                <p
                  style={{
                    margin: "4px 0 8px",
                    fontSize: 14,
                    color: "var(--ink-700)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {n.body}
                </p>

                <footer
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    {n.link && (
                      <a
                        href={n.link}
                        className="q-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        فتح التفاصيل
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!n.read && (
                      <button
                        className="q-btn ghost"
                        onClick={() => onMarkOne(n.id)}
                        disabled={updating}
                      >
                        تعليم كمقروء
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
