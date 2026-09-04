// FILE: src/pages/ClientServices.jsx
// صفحة الخدمات — تصميم "Services.dc.html"
import React from "react";
import { SiteHeader, SiteFooter } from "../components/SiteChrome.jsx";
import { useReveal, waHref } from "../utils/site.js";

const SERVICES = [
  ["استشارة قانونية", "رأي قانوني واضح لحالتك بعد دراسة مستنداتك."],
  ["صياغة العقود", "عقود محكمة تحمي مصالحك وتتوقّع النزاع."],
  ["مراجعة العقود", "تقييم بنود العقد ومخاطره قبل التوقيع."],
  ["إعداد المذكرات واللوائح", "لوائح ومذكرات مبنية على الأنظمة والسوابق."],
  ["أعمال التوثيق", "إتمام التوثيق أمام الجهات المختصة نيابة عنك."],
  ["الخطابات والإنذارات", "خطابات وإنذارات نظامية تحفظ الحق وتوثّق الموقف."],
  ["خدمات الشركات", "من التأسيس إلى الحوكمة والتغييرات النظامية."],
  ["متابعة الطلبات", "متابعة معاملاتك أمام الجهات حتى إنهائها."],
  ["التحكيم", "تسوية النزاعات عبر التحكيم لمسار أسرع وأكثر خصوصية من التقاضي."],
];

export default function ClientServices() {
  useReveal();
  return (
    <div className="site" dir="rtl">
      <SiteHeader active="services" />

      <section className="site-pad-sm site-bg-grad" style={{ paddingTop: "9rem" }}>
        <div className="site-wrap">
          <div className="rv" style={{ maxWidth: 760 }}>
            <div className="site-kicker"><span /><span>خدماتنا</span></div>
            <h1 className="site-h2" style={{ marginBottom: "1.4rem", fontSize: "clamp(2.1rem,4vw,3.4rem)" }}>الخدمات القانونية</h1>
            <p className="site-lead">
              نطاق عمل يغطي الاستشارات والعقود والمذكرات والتوثيق والخطابات وخدمات الشركات ومتابعة الطلبات والتحكيم.
              اختر الخدمة واطلبها مباشرة عبر واتساب.
            </p>
          </div>
        </div>
      </section>

      <section className="site-pad-sm">
        <div className="site-wrap site-grid-4">
          {SERVICES.map(([title, desc], i) => (
            <a
              key={title}
              href={waHref(`السلام عليكم، أرغب في الاستفسار عن خدمة ${title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="site-card hoverable rv"
              style={{ padding: "2rem 1.8rem" }}
            >
              <p className="site-card-num">{String(i + 1).padStart(2, "0")}</p>
              <h3 style={{ fontSize: "1.22rem" }}>{title}</h3>
              <p style={{ fontSize: ".94rem" }}>{desc}</p>
              <span className="site-card-cta">اطلب الخدمة <span className="arw">←</span></span>
            </a>
          ))}
        </div>
      </section>

      <section className="site-cta">
        <span className="site-cta-ring" />
        <div className="site-cta-inner rv">
          <div style={{ maxWidth: 640 }}>
            <h2>لم تجد خدمتك في القائمة؟</h2>
            <p>اكتب لنا موضوعك وسنوجّهك إلى المسار القانوني المناسب.</p>
          </div>
          <a href={waHref("السلام عليكم، لدي استفسار قانوني.")} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary site-btn-lg">
            تواصل معنا عبر واتساب
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
