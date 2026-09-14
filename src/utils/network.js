// FILE: src/utils/network.js
// حالة الاتصال — مخصّصة لتطبيق الجوال فقط عبر @capacitor/network. على الويب
// لا نغيّر أي سلوك موجود إطلاقًا؛ الدوال هنا ببساطة تُعيد "متصل دائمًا" ولا
// تُضاف أي مستمعات، فتبقى صفحات الويب كما هي تمامًا اليوم.
import { Capacitor } from "@capacitor/core";

let cachedConnected = true;
let listenersReady = false;
const listeners = new Set();

async function ensureListening() {
  if (!Capacitor.isNativePlatform() || listenersReady) return;
  listenersReady = true;
  try {
    const { Network } = await import("@capacitor/network");
    const status = await Network.getStatus();
    cachedConnected = !!status.connected;
    Network.addListener("networkStatusChange", (status) => {
      cachedConnected = !!status.connected;
      listeners.forEach((cb) => cb(cachedConnected));
    });
  } catch {
    // لو تعذّر تحميل الإضافة لأي سبب، نفترض الاتصال متاحًا ولا نعطّل شيئًا
    cachedConnected = true;
  }
}
ensureListening();

export function isOnline() {
  if (!Capacitor.isNativePlatform()) return true; // الويب: لا نتدخّل إطلاقًا
  return cachedConnected;
}

export function onNetworkChange(cb) {
  if (!Capacitor.isNativePlatform()) return () => {};
  listeners.add(cb);
  return () => listeners.delete(cb);
}
