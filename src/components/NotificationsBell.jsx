// FILE: src/components/NotificationsBell.jsx
import React, { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../mock/api.js";

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
    if (next && items.length === 0) {
      loadAll();
    }
  }

  async function handleClickNotification(n) {
    try {
      if (!n.read) {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id
              ? {
                  ...x,
                  read: true,
                }
              : x
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      if (n.link) {
        window.location.href = n.link;
      }
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
    return d.toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* زر الجرس */}
      <button
        type="button"
        className="q-btn ghost"
        onClick={toggleOpen}
        title="الإشعارات"
        style={{
          position: "relative",
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        {loadingUnread ? (
          <span style={{ fontSize: 11, color: "var(--ink-600)" }}>…</span>
        ) : unreadCount > 0 ? (
          <span
            style={{
              background: "#EF4444",
              color: "#fff",
              borderRadius: 999,
              padding: "0 6px",
              fontSize: 11,
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {unreadCount}
          </span>
        ) : null}
      </button>

      {/* القائمة المنسدلة */}
      {open && (
        <div
          className="q-card"
          style={{
            position: "absolute",
            top: "110%",
            insetInlineStart: 0, // يمين/يسار حسب RTL
            width: 360,
            maxHeight: 420,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 25px rgba(15,23,42,0.15)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-dark, #1f2937)",
                }}
              >
                الإشعارات
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                آخر تحديث:{" "}
                {new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="q-btn ghost"
                style={{ fontSize: 11, padding: "4px 6px" }}
                onClick={loadAll}
              >
                تحديث
              </button>
              <button
                type="button"
                className="q-btn ghost"
                style={{ fontSize: 11, padding: "4px 6px" }}
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                الكل مقروء
              </button>
            </div>
          </div>

          {err && (
            <div
              style={{
                padding: 10,
                fontSize: 12,
                color: "#b91c1c",
                borderBottom: "1px solid #fee2e2",
                background: "#fef2f2",
              }}
            >
              {err}
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: 16,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                جارٍ تحميل الإشعارات…
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                لا توجد إشعارات حالياً.
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotification(n)}
                  style={{
                    width: "100%",
                    textAlign: "right",
                    border: "none",
                    background: n.read ? "#ffffff" : "#eff6ff",
                    padding: "10px 12px",
                    borderBottom: "1px solid #e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: n.read ? 500 : 600,
                          color: n.read ? "#111827" : "#1d4ed8",
                          marginBottom: 2,
                        }}
                      >
                        {n.title || "إشعار"}
                      </div>
                      {n.body && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#4b5563",
                            maxHeight: 60,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {n.body}
                        </div>
                      )}
                      {n.createdAt && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 4,
                          }}
                        >
                          {formatDateTime(n.createdAt)}
                        </div>
                      )}
                    </div>
                    {!n.read && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: "#2563eb",
                          marginInlineStart: 4,
                          marginTop: 4,
                          flexShrink: 0,
                        }}
                      />
                    )}
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
