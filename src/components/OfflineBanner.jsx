// FILE: src/components/OfflineBanner.jsx
// شريط تنبيه ثابت أعلى الشاشة عند انقطاع الإنترنت — تطبيق الجوال فقط.
// لا يظهر على الويب إطلاقًا ولا يُضاف أي مستمع هناك (انظر utils/network.js).
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { isOnline, onNetworkChange } from "../utils/network.js";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    setOnline(isOnline());
    return onNetworkChange(setOnline);
  }, []);

  if (!Capacitor.isNativePlatform() || online) return null;

  return (
    <div
      dir="rtl"
      style={{
        position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 9999,
        background: "#a3342a", color: "#fff", textAlign: "center",
        fontSize: 13, padding: "8px 12px",
        paddingTop: "max(8px, env(safe-area-inset-top))",
      }}
    >
      لا يوجد اتصال بالإنترنت — سيتم عرض آخر البيانات المتاحة فقط.
    </div>
  );
}
