// FILE: src/utils/site.js — أدوات مشتركة لصفحات الموقع العام
import { useEffect } from "react";

const WA = String(import.meta.env.VITE_WHATSAPP_NUMBER || "966536679918").replace(/[^\d]/g, "");

export function waHref(text) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(text || "السلام عليكم، أرغب في طلب استشارة قانونية.")}`;
}

/* أنيميشن الظهور عند التمرير — تُستدعى مرة في كل صفحة.
   شبكة أمان: أي عنصر لم يظهر خلال 2.5 ثانية (JS بطيء، متصفح لا يدعم
   IntersectionObserver، زاحف بحث) يُكشف تلقائيًا حتى لا يبقى المحتوى مخفيًا. */
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
    document.querySelectorAll(".site .rv").forEach((el) => io.observe(el));

    const t = setTimeout(revealAll, 2500);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);
}
