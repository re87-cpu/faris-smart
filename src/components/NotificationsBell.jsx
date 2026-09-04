// FILE: src/components/NotificationsBell.jsx
import React, { useEffect, useState } from "react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../mock/api.js";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingUnread, setLoadingUnread] = useState(false);
  const [err, setErr] = useState("");

  async function loadUnread() {
    setLoadingUnread(true);
    setErr("");
    try {
      const rows = await fetchNotifications({ unreadOnly: true });
      setUnreadCount(rows.filter((n) => !n.read).length);
    } catch (e) {
      console.error("loadUnread notifications error:", e);
      setErr("تعذّر تحميل الإشعارات.");
    } finally {
      setLoadingUnread(false);
    }
  }

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const rows = await fetchNotifications({ unreadOnly: false });
      rows.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setItems(rows);
      setUnreadCount(rows.filter((n) => !n.read).length);
    } catch (e) {
      console.error("loadAll notifications error:", e);
      setErr("تعذّر تحميل الإشعارات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnread();
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && items.length === 0) loadAll();
  }

  async function handleClickNotification(n) {
    try {
      if (!n.read) {
        await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      if (n.link) window.location.href = n.link;
    } catch (e) {
      console.error("markNotificationRead error:", e);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("markAllNotificationsRead error:", e);
    }
  }

  function formatDateTime(v) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className="btn btn-ghost" onClick={toggleOpen} title="الإشعارات">
        الإشعارات
        {loadingUnread ? (
          <span style={{ fontSize: 11, color: "var(--color-neutral-600)", marginInlineStart: 6 }}>…</span>
        ) : unreadCount > 0 ? (
          <span className="tag tag-accent" style={{ marginInlineStart: 6 }}>{unreadCount}</span>
        ) : null}
      </button>

      {open && (
        <div className="card elev-md" style={{ position: "absolute", insetInlineStart: 0, top: "110%", width: 340, maxHeight: 420, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--color-neutral-300)", zIndex: 999 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingBottom: 10, borderBottom: "1px solid var(--color-neutral-200)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>الإشعارات</div>
              <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
                آخر تحديث: {new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={loadAll}>تحديث</button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={handleMarkAllRead} disabled={unreadCount === 0}>الكل مقروء</button>
            </div>
          </div>

          {err && <div style={{ padding: 10, fontSize: 12, color: "#b3261e" }}>{err}</div>}

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "var(--color-neutral-600)" }}>جارٍ تحميل الإشعارات…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "var(--color-neutral-600)" }}>لا توجد إشعارات حالياً.</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotification(n)}
                  style={{
                    width: "100%", textAlign: "right", border: "none",
                    background: n.read ? "#fff" : "var(--color-accent-100)",
                    padding: "10px 4px", borderBottom: "1px solid var(--color-neutral-200)", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, marginBottom: 2 }}>{n.title || "إشعار"}</div>
                      {n.body && (
                        <div style={{ fontSize: 12, color: "var(--color-neutral-700)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {n.body}
                        </div>
                      )}
                      {n.createdAt && <div style={{ fontSize: 11, color: "var(--color-neutral-500)", marginTop: 4 }}>{formatDateTime(n.createdAt)}</div>}
                    </div>
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent-500)", marginTop: 4, flexShrink: 0 }} />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
