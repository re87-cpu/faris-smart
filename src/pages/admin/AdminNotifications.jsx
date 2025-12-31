import React, { useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function AdminNotifications() {
  const me = getAuth()?.user || null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null); // "all" or id

  async function load() {
    if (!me) return;
    setLoading(true);
    setErr("");
    try {
      const list = await fetchNotifications({ unreadOnly });
      const normalized = (list || []).map((n) => ({
        id: n.id,
        title: n.title || "إشعار",
        body: n.body || "",
        link: n.link || "",
        read: !!(n.read ?? n.is_read ?? false),
        createdAt: n.createdAt || n.created_at || null,
      }));
      setRows(normalized);
    } catch (e) {
      setErr(e.message || "تعذّر تحميل الإشعارات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [me?.id, unreadOnly]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let arr = rows.slice();

    if (s) {
      arr = arr.filter((n) =>
        [n.title, n.body, n.id].some((v) =>
          String(v || "").toLowerCase().includes(s)
        )
      );
    }

    return arr;
  }, [rows, q]);

  const unreadCount = useMemo(() => rows.filter((x) => !x.read).length, [rows]);

  async function onReadOne(n) {
    setErr("");
    try {
      setBusy(n.id);
      await markNotificationRead(n.id);
      await load();
    } catch (e) {
      setErr(e.message || "تعذّر تعليم الإشعار كمقروء.");
    } finally {
      setBusy(null);
    }
  }

  async function onReadAll() {
    setErr("");
    try {
      setBusy("all");
      await markAllNotificationsRead();
      await load();
    } catch (e) {
      setErr(e.message || "تعذّر تعليم الكل كمقروء.");
    } finally {
      setBusy(null);
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
      <section className="q-card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <b>إشعارات المدير</b>
            <span style={{ color: "var(--ink-600)", fontSize: 13 }}>
              غير مقروء: {unreadCount}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="بحث…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              غير المقروء فقط
            </label>

            <button className="q-btn ghost" onClick={load} disabled={loading}>
              تحديث
            </button>

            <button
              className="q-btn primary"
              onClick={onReadAll}
              disabled={busy === "all" || unreadCount === 0}
              title="تعليم جميع الإشعارات كمقروء"
            >
              {busy === "all" ? "جارٍ التنفيذ…" : "تعليم الكل كمقروء"}
            </button>
          </div>
        </div>
      </section>

      {err && (
        <div className="error" style={{ marginInlineStart: 2 }}>
          {err}
        </div>
      )}

      <section className="q-card" style={{ padding: 16 }}>
        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--ink-600)" }}>لا توجد إشعارات.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((n) => {
              const isBusy = busy === n.id;
              return (
                <div
                  key={n.id}
                  className="q-card"
                  style={{
                    padding: 12,
                    border: !n.read ? "1px solid var(--accent)" : "1px solid var(--line)",
                    background: !n.read ? "rgba(45,89,134,0.06)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <b>{n.title}</b>
                        {!n.read && (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 999,
                              border: "1px solid var(--accent)",
                              color: "var(--accent-dark)",
                            }}
                          >
                            جديد
                          </span>
                        )}
                      </div>

                      {n.body ? (
                        <div style={{ color: "var(--ink-700)", lineHeight: 1.7 }}>
                          {n.body}
                        </div>
                      ) : null}

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {n.createdAt ? (
                          <span style={{ fontSize: 12, color: "var(--ink-600)" }}>
                            {new Date(n.createdAt).toLocaleString("ar-SA")}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--ink-600)" }}>—</span>
                        )}

                        {n.link ? (
                          <a className="q-btn ghost" href={n.link}>
                            فتح الرابط
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {!n.read && (
                        <button
                          className="q-btn ghost"
                          onClick={() => onReadOne(n)}
                          disabled={isBusy}
                        >
                          {isBusy ? "…" : "تعليم كمقروء"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
