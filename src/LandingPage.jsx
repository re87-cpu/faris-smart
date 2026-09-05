// FILE: src/LandingPage.jsx
// الصفحة الرئيسية — تصميم "Law Firm Website v2"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, SiteFooter } from "./components/SiteChrome.jsx";
import { useReveal, waHref } from "./utils/site.js";
import { listArticles } from "./mock/api.js";

const SERVICES = [
  { tag: "الأكثر طلبًا", n: "01", title: "استشارة قانونية", desc: "رأي قانوني واضح لحالتك مبنيّ على دراسة دقيقة لمستنداتك، مع بيان الخيارات والمخاطر في كل خيار." },
  { tag: "عقود", n: "02", title: "صياغة العقود", desc: "عقود محكمة الصياغة تحمي مصالحك وتتوقّع النزاع قبل وقوعه." },
  { tag: "مذكرات", n: "03", title: "إعداد المذكرات واللوائح", desc: "لوائح ومذكرات مبنية على الأنظمة والسوابق، مصاغة بلغة قضائية دقيقة." },
];

const PACKAGES = [
  { kicker: "للمنشآت الناشئة والصغيرة", name: "الباقة الأساسية", items: ["استشارتان قانونيتان شهريًا", "مراجعة حتى 4 عقود شهريًا", "صياغة حتى عقدين شهريًا", "التمثيل في حتى 10 قضايا سنويًا"], note: "حماية قانونية أساسية تساعد شركتك على العمل بثقة." },
  { kicker: "الأكثر اختيارًا · الشركات المتوسطة", name: "الباقة المتقدمة", featured: true, items: ["استشارات قانونية غير محدودة", "مراجعة حتى 12 عقدًا شهريًا", "صياغة حتى 6 عقود شهريًا", "4 اجتماعات شهريًا وتقرير شهري", "حتى 50 قضية سنويًا"], note: "توازن مثالي بين التكلفة ونطاق الخدمات، وهو الخيار الأنسب لمعظم الشركات." },
  { kicker: "للمنشآت الكبرى والمجموعات", name: "الباقة الشاملة", items: ["قضايا واستشارات غير محدودة", "صياغة ومراجعة غير محدودة للعقود", "اجتماعات دورية حسب الحاجة", "أولوية وصول للرد خلال ساعتين", "تقارير استراتيجية وحلول مخصصة"], note: "للمنشآت التي تحتاج إلى شريك قانوني دائم يعمل كجزء من فريقها." },
];

const FAQ = [
  ["كيف يمكنني الاستفادة من خدماتكم؟", "تواصل معنا عبر واتساب أو الهاتف وأخبرنا بموضوعك بشكل مختصر، ثم يتولى الفريق دراسة احتياجك واقتراح المسار القانوني المناسب."],
  ["ما الفرق بين باقات الاشتراك؟", "الأساسية للأفراد والمنشآت التي تحتاج دعمًا قانونيًا محدودًا، والمتقدمة لمن يحتاج متابعة واستشارات مستمرة، والشاملة للمنشآت التي تحتاج نطاقًا أوسع من التمثيل والمراجعة الدورية."],
  ["هل يمكن تقديم الخدمة عن بُعد؟", "نعم، تُقدَّم الاستشارات ومراجعة العقود ومتابعة الملفات عن بُعد بالكامل، مع إمكانية الحضور في الجلسات وأمام الجهات المختصة."],
  ["ما مدة الرد على الاستفسارات؟", "نرد على الاستفسارات في أسرع وقت خلال ساعات العمل، ولعملاء الباقة الاحترافية حصولٌ على استجابة خلال 24 ساعة كحد أقصى."],
  ["هل تتعاملون مع القضايا الجزائية؟", "نعم، لدينا خبرة في القضايا الجزائية وتقديم الدفاع والترافع أمام المحاكم المختصة."],
  ["ما سياستكم بشأن السرية؟", "التزام كامل بالسرية التامة تجاه كل ما يتعلق بالموكّل ومستنداته، ولا تُفصح أي معلومة لأي طرف دون موافقته."],
];

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}
function excerpt(s, n = 150) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export default function LandingPage() {
  useReveal();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    listArticles({ limit: 4 })
      .then((rows) => { if (alive) setArticles(rows || []); })
      .catch(() => { if (alive) setArticles([]); });
    return () => { alive = false; };
  }, []);

  const feat = articles[0];
  const rest = articles.slice(1, 4);

  return (
    <div className="site" dir="rtl">
      <SiteHeader active="home" />

      {/* الهيرو */}
      <section className="site-hero site-bg-grad" id="home">
        <span className="site-hero-ring" />
        <span className="site-hero-disc" />
        <div className="site-hero-inner rv">
          <h1>أهلًا بك</h1>
          <p className="site-hero-verse">﴿ إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالإِحْسَانِ ﴾</p>
          <p className="site-hero-sub">
            ممارسة قانونية تُدار بالأمانة، وتُنفَّذ بوضوح، وتُحتكم فيها الأنظمة قبل كل إجراء.
          </p>
          <div className="site-hero-actions">
            <a href={waHref("السلام عليكم، أرغب في طلب استشارة قانونية.")} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary site-btn-lg">
              اطلب استشارتي
            </a>
            <Link to="/services" className="site-btn site-btn-outline site-btn-lg">استكشف خدماتنا</Link>
          </div>
        </div>
      </section>

      {/* من نحن */}
      <section id="about" className="site-pad">
        <div className="site-wrap">
          <div className="site-grid-2">
            <div className="rv">
              <div className="site-about-badge">
                <p>ترخيص</p>
                <p>مرخّص من الهيئة السعودية للمحامين ووزارة العدل</p>
              </div>
            </div>
            <div className="rv d1">
              <div className="site-kicker"><span /><span>من نحن</span></div>
              <h2 className="site-h2" style={{ marginBottom: "1.8rem" }}>خبرة قانونية برؤية حديثة</h2>
              <p className="site-lead" style={{ marginBottom: "1.2rem" }}>
                فارس للمحاماة ممارسة قانونية سعودية تقدّم الاستشارات والتمثيل القانوني للأفراد والمنشآت،
                بمنهجية تجمع بين الدقة النظامية وفهم واقع الأعمال اليومي.
              </p>
              <p className="site-lead" style={{ marginBottom: "2.4rem" }}>
                نتعامل مع كل ملف بوصفه قرارًا يخصّ صاحبه، ونقدّم رأيًا قانونيًا واضحًا وحلولًا قابلة للتنفيذ،
                مع التزام كامل بالسرية.
              </p>
              <div className="site-about-facts">
                <div><p>موثوقية</p><p>معايير عمل مكتوبة لكل مرحلة من مراحل الملف.</p></div>
                <div><p>سرية</p><p>حماية كاملة لمعلومات الموكّل ومستنداته.</p></div>
                <div><p>جودة الخدمة</p><p>متابعة مستمرة وتحديث دوري لحالة القضية.</p></div>
                <div><p>حلول عملية</p><p>رأي قانوني واضح مبني على احتياج العميل.</p></div>
              </div>
              <Link to="/lawyer" className="site-arrowlink">معلومات المحامي <span>←</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* الخدمات */}
      <section id="services" className="site-pad site-bg-soft">
        <div className="site-wrap">
          <div className="site-sechead rv">
            <div style={{ maxWidth: 620 }}>
              <div className="site-kicker"><span /><span>خدماتنا</span></div>
              <h2 className="site-h2">خدماتنا القانونية</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem", maxWidth: 420 }}>
              <p className="site-lead">
                هذه أكثر الخدمات طلبًا.
              </p>
              <Link to="/services" className="site-arrowlink" style={{ alignSelf: "flex-start" }}>عرض جميع الخدمات <span>←</span></Link>
            </div>
          </div>
          <div className="site-grid-3">
            {SERVICES.map((s) => (
              <a
                key={s.n}
                href={waHref(`السلام عليكم، أرغب في الاستفسار عن خدمة ${s.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="site-card hoverable rv"
              >
                <div style={{ display: "flex", alignItems: "center", gap: ".9rem", marginBottom: ".9rem" }}>
                  <span className="site-tag">{s.tag}</span>
                  <span style={{ color: "#8C99A7", fontSize: ".82rem" }}>{s.n}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="site-card-cta">اطلب الخدمة عبر واتساب <span className="arw">←</span></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* اقتباس */}
      <section className="site-quote rv">
        <p>"إذا أردنا احترام القانون، يجب علينا أولاً أن نجعل القانون جديرًا بالاحترام."</p>
        <p>— القاضي لويس برانديز</p>
      </section>

      {/* باقات الاشتراك */}
      <section id="packages" className="site-pad">
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 620, marginBottom: "3.5rem" }}>
            <div className="site-kicker"><span /><span>الاشتراكات</span></div>
            <h2 className="site-h2" style={{ marginBottom: "1.2rem" }}>باقات الاشتراك</h2>
            <p className="site-lead" style={{ marginBottom: "1.6rem" }}>
              دعم قانوني مستمر باتفاق سنوي، بتكلفة واضحة قابلة للتخطيط، بدل مراجعتنا عند كل حادثة.
            </p>
            <Link to="/packages" className="site-arrowlink">مقارنة الباقات بالتفصيل <span>←</span></Link>
          </div>
          <div className="site-grid-3">
            {PACKAGES.map((p) => (
              <div key={p.name} className={`site-price rv${p.featured ? " featured d1" : ""}`}>
                <p className="site-price-kicker">{p.kicker}</p>
                <h3>{p.name}</h3>
                <p style={{ color: p.featured ? "rgba(255,255,255,.75)" : "#5A6878", fontWeight: 300, marginBottom: "2rem" }}>
                  اختر الباقة وتواصل معنا لمعرفة التفاصيل.
                </p>
                <ul>
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

      {/* المقالات */}
      <section id="articles" className="site-pad site-bg-soft">
        <div className="site-wrap">
          <div className="site-sechead rv">
            <div>
              <div className="site-kicker"><span /><span>المعرفة</span></div>
              <h2 className="site-h2">المقالات القانونية</h2>
            </div>
            <Link to="/articles" className="site-arrowlink">عرض جميع المقالات <span>←</span></Link>
          </div>

          {articles.length === 0 ? (
            <div className="site-card rv" style={{ maxWidth: 640 }}>
              <p style={{ marginBottom: 0 }}>لا توجد مقالات منشورة بعد. تابعنا قريبًا لأحدث التحليلات القانونية.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "3rem", alignItems: "start" }} className="site-article-feat">
              <Link to={`/articles/${feat.id}`} className="site-article-card rv site-zoom" style={{ display: "block" }}>
                <div className="site-article-img" style={{ height: 340, marginBottom: "1.6rem", display: "grid", placeItems: "center" }}>
                  <span style={{ fontFamily: "inherit", fontWeight: 800, color: "#9AA7B5" }}>{feat.title}</span>
                </div>
                <div className="site-article-meta">
                  <span className="site-tag">مقال</span>
                  <span>{fmtDate(feat.publishedAt || feat.createdAt)}</span>
                </div>
                <h3 style={{ fontSize: "clamp(1.4rem,2.2vw,2rem)", lineHeight: 1.4, marginBottom: ".9rem" }}>{feat.title}</h3>
                <p style={{ color: "#5A6878", fontWeight: 300, marginBottom: "1.2rem" }}>{excerpt(feat.content, 200)}</p>
                <span className="site-card-cta">اقرأ المقال <span className="arw">←</span></span>
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
                {rest.map((a, i) => (
                  <Link
                    key={a.id}
                    to={`/articles/${a.id}`}
                    className={`site-article-card rv${i ? " d" + i : ""}`}
                    style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1.2rem", alignItems: "start", paddingBottom: "1.6rem", borderBottom: "1px solid var(--s-line)" }}
                  >
                    <div className="site-article-img" style={{ height: 96, display: "grid", placeItems: "center", fontSize: 11, color: "#9AA7B5", padding: 8, textAlign: "center" }}>
                      {a.title.slice(0, 24)}
                    </div>
                    <div>
                      <div style={{ color: "#8C99A7", fontSize: ".78rem", marginBottom: ".4rem" }}>{fmtDate(a.publishedAt || a.createdAt)}</div>
                      <h3 style={{ fontSize: "1.12rem", fontWeight: 700, lineHeight: 1.5, marginBottom: ".4rem" }}>{a.title}</h3>
                      <span className="site-card-cta" style={{ fontSize: ".85rem" }}>اقرأ المقال <span className="arw">←</span></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section id="faq" className="site-pad">
        <div className="site-wrap" style={{ maxWidth: 1040 }}>
          <div className="rv" style={{ marginBottom: "3rem" }}>
            <div className="site-kicker"><span /><span>استفسارات</span></div>
            <h2 className="site-h2">الأسئلة الشائعة</h2>
          </div>
          <div className="site-faq rv d1">
            {FAQ.map(([q, a], i) => (
              <details key={i}>
                <summary><span className="qt">{q}</span><span className="plus">+</span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* دعوة للتواصل */}
      <section className="site-cta">
        <span className="site-cta-ring" />
        <div className="site-cta-inner rv">
          <div style={{ maxWidth: 640 }}>
            <h2>هل تحتاج إلى استشارة قانونية؟</h2>
            <p>فريقنا جاهز لمساعدتك وتوجيهك إلى الحل القانوني المناسب.</p>
          </div>
          <a href={waHref("السلام عليكم، أرغب في طلب استشارة قانونية.")} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary site-btn-lg">
            تواصل معنا عبر واتساب
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
