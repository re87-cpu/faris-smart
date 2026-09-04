// FILE: src/pages/Articles.jsx
// صفحة المقالات — تصميم "Articles.dc.html"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, SiteFooter } from "../components/SiteChrome.jsx";
import { useReveal } from "../utils/site.js";
import { listArticles } from "../mock/api.js";

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}
function excerpt(s, n = 180) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export default function Articles() {
  useReveal();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    listArticles()
      .then((list) => { if (alive) setRows(list || []); })
      .catch((e) => { if (alive) setErr(e.message || "تعذّر تحميل المقالات."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const feat = rows[0];
  const grid = rows.slice(1);

  return (
    <div className="site" dir="rtl">
      <SiteHeader active="articles" />

      <section className="site-pad-sm site-bg-grad" style={{ paddingTop: "9rem" }}>
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 760 }}>
            <div className="site-kicker"><span /><span>المعرفة</span></div>
            <h1 className="site-h2" style={{ fontSize: "clamp(2.1rem,4vw,3.4rem)", marginBottom: "1.2rem" }}>المقالات القانونية</h1>
            <p className="site-lead">
              تحليلات ومقالات يكتبها فريق الشركة في القانون التجاري والشركات والعمل والتنفيذ، بلغة عملية موجّهة لأصحاب القرار.
            </p>
          </div>
        </div>
      </section>

      <section className="site-pad-sm">
        <div className="site-wrap">
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--s-muted)", padding: "2rem" }}>جارٍ التحميل…</p>
          ) : err ? (
            <div className="site-card" style={{ maxWidth: 640, margin: "0 auto", color: "#b3261e" }}>{err}</div>
          ) : rows.length === 0 ? (
            <div className="site-card rv" style={{ maxWidth: 640, margin: "0 auto" }}>
              <p style={{ marginBottom: 0 }}>لا توجد مقالات منشورة حتى الآن.</p>
            </div>
          ) : (
            <>
              <Link to={`/articles/${feat.id}`} className="site-article-card rv site-zoom" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "3rem", alignItems: "center", paddingBottom: "3.5rem", borderBottom: "1px solid var(--s-line)" }}>
                <div className="site-article-img" style={{ height: 440, display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
                  <span style={{ fontWeight: 800, color: "#9AA7B5", fontSize: "1.1rem" }}>{feat.title}</span>
                </div>
                <div>
                  <div className="site-article-meta">
                    <span className="site-tag">مقال مميّز</span>
                    <span>{feat.authorName || "فريق فارس"} · {fmtDate(feat.publishedAt || feat.createdAt)}</span>
                  </div>
                  <h2 className="site-h2" style={{ fontSize: "clamp(1.5rem,2.6vw,2.3rem)", lineHeight: 1.35, marginBottom: "1.1rem" }}>{feat.title}</h2>
                  <p style={{ color: "#5A6878", fontWeight: 300, fontSize: "1.04rem", marginBottom: "1.6rem" }}>{excerpt(feat.content, 220)}</p>
                  <span className="site-card-cta">اقرأ المقال <span className="arw">←</span></span>
                </div>
              </Link>

              {grid.length > 0 && (
                <div className="site-grid-3" style={{ paddingTop: "3.5rem" }}>
                  {grid.map((a, i) => (
                    <Link key={a.id} to={`/articles/${a.id}`} className={`site-article-card rv${i % 3 ? " d" + (i % 3) : ""}`} style={{ display: "flex", flexDirection: "column" }}>
                      <div className="site-article-img" style={{ height: 200, marginBottom: "1.4rem", display: "grid", placeItems: "center", padding: 14, textAlign: "center", fontSize: 13, color: "#9AA7B5" }}>
                        {a.title.slice(0, 40)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: ".8rem", marginBottom: ".6rem", color: "#8C99A7", fontSize: ".8rem" }}>
                        <span style={{ color: "var(--s-accent)", fontWeight: 700 }}>{a.authorName || "فريق فارس"}</span>
                        <span>{fmtDate(a.publishedAt || a.createdAt)}</span>
                      </div>
                      <h3 style={{ fontSize: "1.24rem", fontWeight: 800, lineHeight: 1.5, marginBottom: ".6rem" }}>{a.title}</h3>
                      <p style={{ color: "#5A6878", fontWeight: 300, fontSize: ".95rem", marginBottom: "1.1rem" }}>{excerpt(a.content, 120)}</p>
                      <span className="site-card-cta" style={{ marginTop: "auto" }}>اقرأ المقال <span className="arw">←</span></span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
