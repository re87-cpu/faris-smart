// FILE: src/utils/site.js — أدوات مشتركة لصفحات الموقع العام
import { useEffect } from "react";

const WA = String(import.meta.env.VITE_WHATSAPP_NUMBER || "966536679918").replace(/[^\d]/g, "");

export function waHref(text) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(text || "السلام عليكم، أرغب في طلب استشارة قانونية.")}`;
}

/* أنيميشن الظهور عند التمرير — تُستدعى مرة في كل صفحة.
   شبكة أمان: أي عنصر لم يظهر خلال 2.5 ثانية (JS بطيء، متصفح لا يدعم
   IntersectionObserver، زاحف بحث) يُكشف تلقائيًا حتى لا يبقى المحتوى مخفيًا.
   عناصر .rv تُضاف أحيانًا بعد التحميل الأول (بيانات تُجلب من الـAPI مثل
   قائمة المقالات) — MutationObserver يلتقطها فور ظهورها في الـDOM بدل ما
   تنتظر شبكة الأمان (كانت تبقى مخفية لثوانٍ بدون سبب واضح). */
export function useReveal() {
  useEffect(() => {
    const revealAll = () =>
      document.querySelectorAll(".site .rv:not(.in)").forEach((el) => el.classList.add("in"));

    if (typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const observeNew = (root) => {
      root.querySelectorAll(".site .rv").forEach((el) => io.observe(el));
    };
    observeNew(document);

    let mo;
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches?.(".rv")) io.observe(node);
            node.querySelectorAll?.(".rv").forEach((el) => io.observe(el));
          });
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    const t = setTimeout(revealAll, 2500);
    return () => { clearTimeout(t); io.disconnect(); mo?.disconnect(); };
  }, []);
}
