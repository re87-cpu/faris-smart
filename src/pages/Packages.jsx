// FILE: src/pages/Packages.jsx
// صفحة باقات الاشتراك — تصميم "Packages.dc.html" (بدون أسعار)
import React from "react";
import { SiteHeader, SiteFooter } from "../components/SiteChrome.jsx";
import { useReveal, waHref } from "../utils/site.js";

const WHY = [
  ["حماية استباقية", "تساعدك على اكتشاف المخاطر ومعالجتها قبل أن تتحول إلى خسائر."],
  ["سرعة في اتخاذ القرار", "وصول سريع إلى استشارة قانونية موثّقة عند الحاجة دون إجراءات تعاقد جديدة."],
  ["تكلفة سنوية واضحة", "تخطيط أفضل للمصروفات القانونية دون مفاجآت أو تكاليف غير متوقعة."],
  ["معرفة أعمق بأعمالك", "فهم دائم لطبيعة شركتك يمكّننا من تقديم حلول قانونية أكثر فاعلية."],
  ["تقليل النزاعات والخسائر", "من خلال قرارات صحيحة وعقود محكمة وإجراءات سليمة تقلّل من احتمالية النزاع."],
];

const PACKAGES = [
  { kicker: "للمنشآت الناشئة والصغيرة", name: "الباقة الأساسية", items: ["استشارتان قانونيتان شهريًا", "مراجعة حتى 4 عقود شهريًا", "صياغة حتى عقدين شهريًا", "إعداد وإرسال حتى 4 إنذارات أو مطالبات شهريًا", "الرد على الاستفسارات خلال 24 ساعة عمل", "التمثيل في حتى 10 قضايا سنويًا", "خدمات الموارد البشرية الأساسية"], note: "الهدف: حماية قانونية أساسية تساعد شركتك على العمل بثقة واطمئنان." },
  { kicker: "الأكثر اختيارًا · الشركات المتوسطة والنامية", name: "الباقة المتقدمة", featured: true, items: ["استشارات قانونية غير محدودة خلال وقت العمل", "مراجعة حتى 12 عقدًا شهريًا", "صياغة حتى 6 عقود شهريًا", "4 اجتماعات حضورية أو افتراضية شهريًا", "حتى 15 إنذارًا ومطالبة قانونية شهريًا", "رد فوري خلال نفس يوم العمل", "حتى 50 قضية سنويًا بمختلف أنواعها", "تقرير قانوني شهري شامل"], note: "توازن متوازن بين التكلفة ونطاق الخدمات، وهو الخيار الأكثر ملاءمة لمعظم الشركات." },
  { kicker: "للمنشآت الكبرى والمجموعات", name: "الباقة الشاملة", items: ["قضايا غير محدودة أمام كافة الجهات القضائية", "استشارات غير محدودة على مدار الساعة", "صياغة ومراجعة غير محدودة للعقود والمستندات", "اجتماعات دورية حسب الحاجة مع عروض قانونية", "أولوية وصول للرد خلال ساعتين", "خدمات موارد بشرية متقدمة وشاملة", "تقارير استراتيجية دورية وحلول مخصصة"], note: "للمنشآت التي تحتاج إلى شريك قانوني دائم يعمل كجزء من فريقها." },
];

const TABLE = [
  ["عدد الاستشارات القانونية", "2 شهريًا", "غير محدودة", "غير محدودة"],
  ["مراجعة العقود", "4 عقود شهريًا", "12 عقدًا شهريًا", "غير محدود"],
  ["صياغة العقود", "عقدان شهريًا", "6 عقود شهريًا", "غير محدود"],
  ["اجتماعات حضورية / افتراضية", "اجتماع واحد شهريًا", "4 اجتماعات شهريًا", "حسب الحاجة"],
  ["خدمات الموارد البشرية", "أساسية", "متكاملة", "متقدمة وشاملة"],
  ["الإنذارات والمطالبات", "4 شهريًا", "15 شهريًا", "غير محدود"],
  ["الرد على الاستفسارات", "خلال 24 ساعة", "خلال نفس يوم العمل", "أولوية وصول خلال ساعتين"],
  ["القضايا المشمولة سنويًا", "10 قضايا", "50 قضية", "غير محدود"],
  ["التقارير القانونية", "—", "تقرير شهري", "تقرير دوري واجتماعات تنفيذية"],
];

const STEPS = [
  "تحديد طبيعة الاحتياج والأهداف",
  "اختيار الخدمات المناسبة لك",
  "تجهيز الباقة المخصصة وفق الأولويات",
  "متابعة وتنفيذ احترافي مستمر",
  "تحقيق أفضل النتائج بأعلى كفاءة",
];

export default function Packages() {
  useReveal();
  return (
    <div className="site" dir="rtl">
      <SiteHeader active="packages" />

      <section className="site-pad-sm site-bg-grad" style={{ paddingTop: "9rem" }}>
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 820, marginBottom: "4rem" }}>
            <div className="site-kicker"><span /><span>العقد السنوي</span></div>
            <h1 className="site-h2" style={{ fontSize: "clamp(2.1rem,4vw,3.4rem)", marginBottom: ".9rem" }}>الدعم القانوني المستمر</h1>
            <p style={{ fontSize: "clamp(1.1rem,1.8vw,1.4rem)", color: "var(--s-accent)", fontWeight: 700, marginBottom: "1.6rem" }}>
              استثمار في استمرارية ونجاح أعمالك
            </p>
            <p className="site-lead" style={{ marginBottom: "1rem" }}>
              في بيئة الأعمال المتغيرة، لا تكمن المخاطر فقط في النزاعات والقضايا، بل في القرارات اليومية والعقود
              والإجراءات التي تؤثر على مستقبل الشركة.
            </p>
            <p className="site-lead">
              الاشتراك السنوي يمنح شركتك دعمًا قانونيًا مستمرًا وحماية استباقية تساعدك على حماية أعمالك وتقليل المخاطر
              واتخاذ قرارات أكثر أمانًا وثقة.
            </p>
          </div>
          <div className="rv d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem" }}>
            {WHY.map(([t, d]) => (
              <div key={t} style={{ borderTop: "1px solid #D8DEE6", paddingTop: "1.2rem" }}>
                <p style={{ fontWeight: 700, color: "var(--s-navy)", marginBottom: ".4rem" }}>{t}</p>
                <p style={{ fontSize: ".92rem", color: "var(--s-muted)", fontWeight: 300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-quote rv" style={{ padding: "4.5rem 2.5rem" }}>
        <p style={{ fontSize: "clamp(1.25rem,2.4vw,1.9rem)" }}>
          صُمّمت باقاتنا لتمنح شركتك دعمًا قانونيًا مستمرًا بتكلفة واضحة قابلة للتخطيط.
        </p>
      </section>

      <section className="site-pad">
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 720, marginBottom: "3.5rem" }}>
            <h2 className="site-h2" style={{ marginBottom: "1rem" }}>ثلاث باقات بمستويات مختلفة</h2>
            <p className="site-lead">اختر الباقة التي تمنحك الدعم القانوني الأنسب لحجم أعمالك، وتواصل معنا لمعرفة التفاصيل.</p>
          </div>
          <div className="site-grid-3">
            {PACKAGES.map((p) => (
              <div key={p.name} className={`site-price rv${p.featured ? " featured d1" : ""}`}>
                <p className="site-price-kicker">{p.kicker}</p>
                <h3>{p.name}</h3>
                <ul style={{ marginTop: ".4rem" }}>
                  {p.items.map((it, i) => <li key={i}><span>✓</span> {it}</li>)}
                </ul>
                <p className="site-price-note">{p.note}</p>
                <a
                  href={waHref(`السلام عليكم، أرغب في معرفة تفاصيل ${p.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`site-btn ${p.featured ? "" : "site-btn-outline"}`}
                  style={p.featured ? { background: "#fff", color: "var(--s-navy)", borderColor: "#fff" } : {}}
                >
                  اطلب الباقة
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-pad site-bg-soft">
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 720, marginBottom: "3rem" }}>
            <h2 className="site-h2" style={{ marginBottom: "1rem" }}>مقارنة الباقات</h2>
            <p className="site-lead">جميع بنود الخدمة في الباقات الثلاث في جدول واحد. اختر ما يناسبك وتواصل معنا لمعرفة التفاصيل.</p>
          </div>
          <div className="site-table-wrap rv d1">
            <table className="site-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "right" }}>الخدمة</th>
                  <th>الأساسية</th>
                  <th className="hl">المتقدمة · الأكثر اختيارًا</th>
                  <th>الشاملة</th>
                </tr>
              </thead>
              <tbody>
                {TABLE.map((r) => (
                  <tr key={r[0]}>
                    <td className="rowhead">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td className="hl">{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rv d2" style={{ marginTop: "1.6rem", color: "var(--s-muted)", fontSize: ".98rem", fontWeight: 300 }}>
            صُمّمت <strong style={{ color: "var(--s-accent)", fontWeight: 700 }}>الباقة المتقدمة</strong> لتوفير التوازن الأمثل بين
            التكلفة ونطاق الخدمات، ما يجعلها الخيار الأكثر ملاءمة لمعظم الشركات.
          </p>
        </div>
      </section>

      <section className="site-pad">
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 820, marginBottom: "3rem" }}>
            <h2 className="site-h2" style={{ marginBottom: "1rem" }}>لأن كل عمل مختلف… نُفصّل الباقة التي تناسبك تمامًا</h2>
            <p className="site-lead">نمنحك مرونة كاملة لاختيار وبناء الباقة القانونية التي تلبّي احتياجك بدقة.</p>
          </div>
          <div className="rv d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ borderTop: "1px solid #D8DEE6", paddingTop: "1.2rem" }}>
                <p style={{ color: "var(--s-accent)", fontWeight: 700, fontSize: ".86rem", marginBottom: ".3rem" }}>{String(i + 1).padStart(2, "0")}</p>
                <p style={{ fontWeight: 700, color: "var(--s-navy)" }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-cta">
        <span className="site-cta-ring" />
        <div className="site-cta-inner rv">
          <div style={{ maxWidth: 680 }}>
            <h2>لا تتقيّد بباقات جاهزة</h2>
            <p>اختر مكوّناتك، حدّد أولوياتك، واترك الباقي علينا.</p>
          </div>
          <a href={waHref("السلام عليكم، أرغب في باقة مخصصة تناسب احتياج شركتي.")} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary site-btn-lg">
            تحدث معنا عبر واتساب
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
