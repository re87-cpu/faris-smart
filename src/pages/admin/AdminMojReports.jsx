// FILE: src/pages/admin/AdminMojReports.jsx
// قائمة الإصدارات الشهرية من موقع وزارة العدل — تُكتشف تلقائيًا (كل 6 ساعات)
// وتُنزَّل مباشرة من هنا، بدل الاعتماد على رابط خارجي يتابعه أحد يدويًا.
import { useEffect, useState } from "react";
import { listMojReports } from "../../mock/api.js";
import { httpBlob } from "../../utils/http.js";

export default function AdminMojReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [downloadingUrl, setDownloadingUrl] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const rows = await listMojReports();
        setReports(rows);
      } catch (e) {
        setErr(e.message || "تعذّر تحميل التقارير.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function download(r) {
    setDownloadingUrl(r.fileUrl);
    setErr("");
    try {
      const blob = await httpBlob(r.fileUrl);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${r.name || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      setErr(e.message || "تعذّر تحميل الملف.");
    } finally {
      setDownloadingUrl("");
    }
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">التقارير الشهرية — وزارة العدل</div>
        <div style={{ color: "var(--color-neutral-600)", marginTop: 4, fontSize: 13 }}>
          نراقب موقع الوزارة تلقائيًا كل عدة ساعات؛ عند صدور إصدار جديد يصلك إشعار هنا ويظهر في القائمة أدناه للتحميل المباشر.
        </div>
      </div>

      {err && <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", color: "#a3342a" }}>{err}</div>}

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا توجد إصدارات مكتشفة بعد.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>الإصدار</th><th>الرقم الموحّد</th><th>تاريخ الاكتشاف</th><th></th></tr></thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td><b>{r.name}</b></td>
                    <td>{r.unifiedNumber || "—"}</td>
                    <td>{new Date(r.discoveredAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</td>
                    <td style={{ textAlign: "left" }}>
                      <button
                        type="button" className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }}
                        disabled={downloadingUrl === r.fileUrl} onClick={() => download(r)}
                      >
                        {downloadingUrl === r.fileUrl ? "…" : "تحميل"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
