// FILE: src/LandingPage.jsx
// الصفحة الرئيسية — تصميم "Law Firm Website v2"
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, SiteFooter } from "./components/SiteChrome.jsx";
import { useReveal, waHref } from "./utils/site.js";
import { listArticles } from "./mock/api.js";
import logo from "./assets/logo-mark.png";
import heroVideo from "./assets/horse-hero-v4.mp4";
import heroPoster from "./assets/horse-hero-poster-v4.jpg";

const SERVICES = [
  { num: "01", tag: "الأكثر طلبًا", title: "استشارة قانونية", desc: "رأي قانوني واضح لحالتك مبني على دراسة دقيقة لمستنداتك، مع بيان الخيارات ومخاطر كل خيار.", wa: "السلام عليكم، أرغب في الاستفسار عن خدمة استشارة قانونية." },
  { num: "02", tag: "عقود", title: "صياغة العقود", desc: "عقود محكمة الصياغة تحمي مصالحك وتمنع النزاع قبل وقوعه.", wa: "السلام عليكم، أرغب في الاستفسار عن خدمة صياغة العقود." },
  { num: "03", tag: "مذكرات", title: "إعداد المذكرات واللوائح", desc: "لوائح ومذكرات مبنية على الأنظمة والسوابق، مصاغة بلغة قضائية دقيقة.", wa: "السلام عليكم، أرغب في الاستفسار عن خدمة إعداد المذكرات واللوائح." },
];

const STAGES = [
  ["فهم المسألة", "نستمع لموضوعك ونجمع كل ما يخصه من مستندات ومعلومات."],
  ["تحديد الطريق", "نضع المسارات القانونية الممكنة، ونوضح ما يناسب حالتك."],
  ["التحليل", "دراسة دقيقة للأنظمة والسوابق ذات الصلة بملفك."],
  ["الإجراء", "تنفيذ الخطوات اللازمة، صياغة أو تمثيلًا أو متابعة."],
  ["الوصول", "قرار واضح، وملف موثق، ومتابعة حتى إغلاقه."],
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

// وصلة زخرفية بين الأقسام — خط رأسي يمتد ونقطة تظهر عند التمرير إليه.
function RoadLink({ dark }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`road-link${dark ? " road-link-dark" : ""}`} aria-hidden="true">
      <span className="road-link-line" />
      <span className="road-link-dot" />
    </div>
  );
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

  const heroVideoRef = useRef(null);
  // على الجوال (شاشة ضيقة، غالبًا شبكة أبطأ وسياسات تشغيل تلقائي أشد) نتجاوز
  // الفيديو كليًا ونعرض النص فورًا فوق صورة البوستر الثابتة — أخف وأضمن.
  // القيمة الابتدائية تُحسب قبل أول رسم حتى لا يبدأ المتصفح بتحميل الفيديو
  // على الجوال أصلًا (لا مجرد تجاهل تشغيله بعد التحميل).
  const [heroVideoOn] = useState(
    () => !(window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
  const [heroRevealed, setHeroRevealed] = useState(() => !heroVideoOn);

  const onHeroTimeUpdate = () => {
    const v = heroVideoRef.current;
    if (v && v.duration && v.currentTime >= v.duration - 0.7) setHeroRevealed(true);
  };

  // يشتغل مرة واحدة فقط عند تحميل الصفحة — لا يعيد نفسه لو خرج الزائر من
  // قسم الهيرو بالتمرير ورجع له. مهلة أمان حتى لا يبقى النص مخفيًا لو
  // تعطّل التشغيل التلقائي أو تأخر تحميل الفيديو لأي سبب.
  useEffect(() => {
    if (!heroVideoOn) return;
    const video = heroVideoRef.current;
    if (!video) return;
    video.play().catch(() => setHeroRevealed(true));
    const safety = setTimeout(() => setHeroRevealed(true), 8000);
    return () => clearTimeout(safety);
  }, [heroVideoOn]);

  return (
    <div className="site" dir="rtl">
      <SiteHeader active="home" />

      {/* الهيرو */}
      <section className="site-hero" id="home">
        {heroVideoOn ? (
          <video
            className="site-hero-video"
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={heroPoster}
            ref={heroVideoRef}
            onTimeUpdate={onHeroTimeUpdate}
            onEnded={() => setHeroRevealed(true)}
            onError={() => setHeroRevealed(true)}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img className="site-hero-video" src={heroPoster} alt="" aria-hidden="true" />
        )}
        <div className="site-hero-scrim" aria-hidden="true" />
        <div className={`site-hero-content${heroRevealed ? " reveal" : ""}`}>
          <div className="site-hero-welcome">
            <h1 className="site-hero-welcome-title">أهلًا بك</h1>
            <p className="site-hero-welcome-sub">حيث تُفهم قضيتك، ويُصان حقك.</p>
          </div>
          <div className="site-hero-actions-wrap">
            <div className="site-hero-actions">
              <a href={waHref("السلام عليكم، أرغب في طلب استشارة قانونية.")} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary">
                سؤالك هو بداية الطريق
              </a>
              <Link to="/services" className="site-btn site-btn-outline">استكشف خدماتنا</Link>
            </div>
          </div>
        </div>
        <a href="#about" className="site-hero-arrow" aria-label="التالي">
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M7 0v14M1 9l6 6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </section>

      <RoadLink />

      {/* من نحن */}
      <section id="about" className="site-pad" style={{ position: "relative", overflow: "hidden" }}>
        <div className="site-wrap">
          <div className="rv" style={{ marginBottom: "2.4rem" }}>
            <div className="site-kicker"><span /><span>من نحن</span></div>
            <h2 className="site-h2">خبرة قانونية برؤية حديثة</h2>
          </div>
          <div className="about-grid">
            <div className="rv" style={{ position: "relative" }}>
              <div style={{ width: "100%", aspectRatio: "1/1", display: "grid", placeItems: "center" }}>
                <img src={logo} alt="فارس للمحاماة" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div
                className="about-license-badge"
                style={{
                  position: "absolute", left: "-1rem", background: "var(--s-navy)", color: "#fff",
                  padding: ".8rem .9rem", borderRadius: 4, width: 150, boxShadow: "0 10px 24px rgba(23,32,45,.22)",
                }}
              >
                <p style={{ fontSize: ".72rem", fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  مرخّص من الهيئة السعودية للمحامين ووزارة العدل
                </p>
              </div>
            </div>
            <div className="rv d1">
              <p className="site-lead" style={{ marginBottom: "1.2rem" }}>
                فارس للمحاماة ممارسة قانونية سعودية تقدّم الاستشارات والتمثيل القانوني للأفراد والمنشآت،
                بمنهجية تجمع بين الدقة النظامية وفهم واقع الأعمال اليومي.
              </p>
              <p className="site-lead">
                نتعامل مع كل ملف بوصفه قرارًا يخصّ صاحبه، ونقدّم رأيًا قانونيًا واضحًا وحلولًا قابلة للتنفيذ،
                مع التزام كامل بالسرية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* لماذا فارس */}
      <section id="values" className="site-pad-sm site-bg-soft">
        <div className="site-wrap values-grid">
          <div className="rv" style={{ alignSelf: "start" }}>
            <div className="site-kicker"><span /><span>لماذا فارس</span></div>
            <h2 className="site-h2" style={{ fontSize: "clamp(1.8rem,2.8vw,2.5rem)", lineHeight: 1.45 }}>
              معايير عمل لا تتبدل من ملف لآخر.
            </h2>
          </div>
          <div className="rv d1 route-v">
            <div className="route-v-line" aria-hidden="true" />
            {[
              ["01", "مهنية", "معايير عمل مكتوبة لكل مرحلة من مراحل الملف."],
              ["02", "سرية", "حماية كاملة لمعلومات الموكّل ومستنداته."],
              ["03", "جودة الخدمة", "متابعة مستمرة وتحديث دوري لحالة القضية."],
              ["04", "حلول عملية", "رأي قانوني واضح مبني على احتياج العميل."],
            ].map(([num, title, desc]) => (
              <div className="dest" key={num}>
                <div className="marker"><span className="dot" /><span className="num">{num}</span></div>
                <div className="content">
                  <p className="dtitle" style={{ fontWeight: 700, color: "var(--s-navy)", fontSize: "1.2rem", marginBottom: ".5rem" }}>{title}</p>
                  <p style={{ fontSize: "1rem", color: "var(--s-muted)", fontWeight: 300 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الخدمات — محطات على الطريق */}
      <section id="services" className="site-pad site-bg-soft">
        <div className="site-wrap">
          <div className="site-sechead rv">
            <div style={{ maxWidth: 520 }}>
              <div className="site-kicker"><span /><span>خدماتنا</span></div>
              <h2 className="site-h2">محطات على طريق فارس</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem", maxWidth: 400 }}>
              <p className="site-lead">
                هذه أكثر الخدمات طلبًا.
              </p>
              <Link to="/services" className="site-arrowlink" style={{ alignSelf: "flex-start" }}>عرض جميع الخدمات <span>←</span></Link>
            </div>
          </div>
          <div className="rv d1 route-v">
            <div className="route-v-line" aria-hidden="true" />
            {SERVICES.map((s) => (
              <a key={s.num} href={waHref(s.wa)} target="_blank" rel="noopener noreferrer" className="dest">
                <div className="marker"><span className="dot" /><span className="num">{s.num}</span></div>
                <div className="content">
                  <span className="site-tag" style={{ marginBottom: ".9rem" }}>{s.tag}</span>
                  <h3 className="dtitle" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--s-navy)", lineHeight: 1.4, marginBottom: ".6rem" }}>{s.title}</h3>
                  <p style={{ color: "#5A6878", fontWeight: 300, fontSize: "1rem", marginBottom: "1rem", maxWidth: 560 }}>{s.desc}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: ".7rem", color: "var(--s-accent)", fontWeight: 700, fontSize: ".92rem" }}>
                    اطلب الخدمة عبر واتساب <span className="darw">←</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <RoadLink />

      {/* كيف نعمل */}
      <section id="how" className="site-pad" style={{ paddingBottom: "8rem" }}>
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 620, marginBottom: "5rem" }}>
            <div className="site-kicker"><span /><span>منهجيتنا</span></div>
            <h2 className="site-h2">من السؤال إلى القرار، خطوة بخطوة</h2>
          </div>
          <div className="rv d1 route-h">
            <div className="route-h-line" aria-hidden="true" />
            {STAGES.map(([title, desc]) => (
              <div className="stage" key={title}>
                <span className="dot" />
                <p style={{ fontWeight: 700, color: "var(--s-navy)", fontSize: "1.08rem", marginBottom: ".5rem" }}>{title}</p>
                <p style={{ color: "var(--s-muted)", fontWeight: 300, fontSize: ".92rem" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RoadLink dark />

      {/* اقتباس */}
      <section className="site-quote rv">
        <p>«ما يمكننا فعله، هو تشجيع قوة القانون.»</p>
        <p>— سمو ولي العهد الأمير محمد بن سلمان</p>
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

      <RoadLink />

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

      {/* دعوة للتواصل — مشهد الوصول */}
      <section id="contact" className="site-cta-arrival">
        <div className="site-wrap" style={{ maxWidth: 720, textAlign: "center" }}>
          <p className="rv" style={{ color: "rgba(255,255,255,.5)", fontSize: "1.02rem", fontWeight: 300, marginBottom: "1.6rem" }}>
            لكل مسألةٍ طريق.
          </p>
          <h2 className="rv d1" style={{ color: "#fff", fontSize: "clamp(2rem,3.6vw,3.2rem)", fontWeight: 800, lineHeight: 1.35, marginBottom: "1.4rem" }}>
            ابدأ طريقك مع فارس.
          </h2>
          <p className="rv d2" style={{ color: "rgba(255,255,255,.72)", fontSize: "1.08rem", fontWeight: 300, marginBottom: "3rem" }}>
            فريقنا جاهز لمساعدتك وتوجيهك إلى الحل القانوني المناسب.
          </p>
          <a
            className="rv d2"
            href={waHref("السلام عليكم، أرغب في طلب استشارة قانونية.")}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: ".9rem", background: "var(--s-accent)", color: "#fff",
              padding: "1.15rem 2.6rem", borderRadius: 4, fontSize: "1.02rem", fontWeight: 700,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            تواصل معنا عبر واتساب
          </a>
        </div>
      </section>

      <RoadLink dark />

      <SiteFooter />
    </div>
  );
}
