// FILE: src/pages/LawyerProfile.jsx
// معلومات المحامي — بأسلوب الموقع العام
import React from "react";
import lawyerImg from "../assets/lawyer.jpeg";
import { SiteHeader, SiteFooter } from "../components/SiteChrome.jsx";
import { useReveal, waHref } from "../utils/site.js";

const APPROACH = [
  "الالتزام بالأنظمة واللوائح الرسمية داخل المملكة.",
  "شرح الخطوات بوضوح قبل أي إجراء، وبشفافية في التوقعات.",
  "عناية دقيقة بالصياغة القانونية لضمان الحقوق وتقليل المخاطر.",
  "سرية مهنية تامة وحفظ بيانات العملاء دون مساومة.",
];

const box = { border: "1px solid var(--s-line)", borderRadius: 4, padding: "1.6rem 1.8rem", display: "grid", gap: 12, background: "#fff" };

export default function LawyerProfile() {
  useReveal();
  return (
    <div className="site" dir="rtl">
      <SiteHeader />

      <section className="site-pad-sm" style={{ paddingTop: "9rem" }}>
        <div className="site-wrap" style={{ maxWidth: 900 }}>
          <div className="rv" style={{ marginBottom: "2.4rem" }}>
            <div className="site-kicker"><span /><span>المحامي</span></div>
            <h1 className="site-h2">معلومات المحامي</h1>
          </div>

          <div className="site-card rv d1" style={{ gap: 20, padding: "2.2rem" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <img src={lawyerImg} alt="صورة المحامي" style={{ width: 108, height: 108, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--s-line)" }} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--s-navy)" }}>فارس محمد الغامدي</div>
                <p style={{ marginTop: 8, color: "var(--s-body)", lineHeight: 1.9, fontWeight: 300 }}>
                  محامٍ يلتزم بالأمانة ومخافة الله، ويحفظ أسرار عملائه، ويحرص على وضوح الإجراء وجودة الصياغة.
                </p>
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="site-tag">التزام مهني</span>
                  <span className="site-tag">سرية تامة</span>
                  <span className="site-tag">وضوح الإجراءات</span>
                </div>
              </div>
            </div>

            <div style={box}>
              <div style={{ fontWeight: 700, color: "var(--s-navy)" }}>المؤهل العلمي</div>
              <div style={{ color: "var(--s-body)", fontWeight: 300 }}>بكالوريوس قانون — مع مرتبة الشرف</div>
            </div>

            <div style={box}>
              <div style={{ fontWeight: 700, color: "var(--s-navy)" }}>المنهج المهني</div>
              <div style={{ display: "grid", gap: 8 }}>
                {APPROACH.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--s-body)", fontWeight: 300, lineHeight: 1.9 }}>
                    <span style={{ width: 7, height: 7, background: "var(--s-accent)", marginTop: 9, flex: "0 0 7px" }} />
                    {t}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 4, padding: "10px 14px", background: "#EAF0F6", color: "var(--s-navy)", fontWeight: 500, lineHeight: 1.9 }}>
                "نؤدي الأمانة، ونخاف الله في أعمالنا، ونسعى لحلول نظامية تحفظ الحقوق."
              </div>
            </div>

            <div style={box}>
              <div style={{ fontWeight: 700, color: "var(--s-navy)" }}>بيانات الترخيص</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--s-line)" }}>
                <span style={{ fontWeight: 700 }}>رقم ترخيص مزاولة المحاماة</span>
                <span style={{ fontWeight: 700, color: "var(--s-accent)" }}>472814</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--s-line)" }}>
                <span style={{ fontWeight: 700 }}>رقم ترخيص التوثيق</span>
                <span style={{ fontWeight: 700, color: "var(--s-accent)" }}>47/111672</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="https://sa.linkedin.com/in/%D9%81%D8%A7%D8%B1%D8%B3-%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A-7566972a1" target="_blank" rel="noopener noreferrer" className="site-btn site-btn-outline site-btn-sm">LinkedIn</a>
              <a href="mailto:FLF.LAWYER@gmail.com" className="site-btn site-btn-outline site-btn-sm">البريد الإلكتروني</a>
              <a href={waHref("السلام عليكم، أرغب في التواصل بخصوص خدمة قانونية.")} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary site-btn-sm">تواصل عبر واتساب</a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
