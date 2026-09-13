// FILE: src/utils/pushNotifications.js
// تسجيل الجهاز لاستقبال إشعارات فورية (Push) — لا يعمل شيء منه على الويب،
// وفشله (لو لم يُضبط Firebase على الباك-إند) لا يجب أن يوقف أي شيء آخر.
import { Capacitor } from "@capacitor/core";
import { http } from "./http.js";

let initialized = false;

export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return; // الويب لا يسجّل أي جهاز إطلاقًا
  if (initialized) return;
  initialized = true;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== "granted") {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== "granted") return; // المستخدم رفض — لا بأس، النظام يعمل بدونها
    }

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      try {
        await http("POST", "/notifications/register-device", {
          token: token.value,
          platform: Capacitor.getPlatform(), // "ios" أو "android"
        });
      } catch { /* فشل تسجيل الجهاز لا يوقف شيئًا آخر */ }
    });

    PushNotifications.addListener("registrationError", () => {
      // تجاهل — النظام يستمر يعمل بدون إشعارات فورية
    });

    // عند الضغط على إشعار فورى والتطبيق مغلق/بالخلفية: افتح الرابط المرفق (نفس نمط جرس الإشعارات الحالي)
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const link = action?.notification?.data?.link;
      if (link) window.location.href = link;
    });
  } catch { /* المنصة لا تدعم Push أو الحزمة غير متاحة — تجاهل بصمت */ }
}

export async function clearDeviceRegistration(token) {
  if (!Capacitor.isNativePlatform() || !token) return;
  try { await http("POST", "/notifications/unregister-device", { token }); } catch { /* تجاهل */ }
}
