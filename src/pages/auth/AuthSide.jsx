// FILE: src/pages/auth/AuthSide.jsx
// اللوحة الجانبية المشتركة بين تسجيل الدخول وإنشاء الحساب: فيديو خلفية +
// تظليل + شعار + بيت/جملة ترحيبية تظهر بعد انتهاء الفيديو.
//
import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import authVideo from "../../assets/faris-login-intro.mp4";

export default function AuthSide({ quote }) {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setVideoEnded(true);
  }, []);

  return (
    <aside className="ind-authside">
      <video
        className="ind-authside-video"
        src={authVideo}
        autoPlay={!videoEnded}
        muted
        playsInline
        preload="metadata"
        onEnded={() => setVideoEnded(true)}
        onError={() => setVideoEnded(true)}
      />
      <div className="ind-authside-tint" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <img src={logo} alt="فارس" className="ind-authside-logo" />
      </div>
      <div style={{ position: "relative", zIndex: 1, opacity: videoEnded ? 1 : 0, transition: "opacity .8s ease" }}>
        <div className="ind-authside-quote">{quote}</div>
      </div>
      <div className="ind-authside-copy" style={{ position: "relative", zIndex: 1 }}>© {new Date().getFullYear()} شركة فارس محمد الغامدي</div>
    </aside>
  );
}
