// FILE: src/utils/platformStorage.js
// مهايئ تخزين واحد للويب والتطبيق — بدل نثر فحوصات "هل نحن داخل تطبيق؟" في
// كل ملف. القاعدة:
//  - على الويب: localStorage كما هو تمامًا اليوم (لا تغيير في سلوك الموقع).
//  - داخل تطبيق Capacitor:
//      * plain(get/set/remove)   → @capacitor/preferences (بيانات غير حساسة: الدور، بيانات المستخدم المخبّأة).
//      * secure(get/set/remove)  → مخزن آمن (Keychain على iOS / Keystore عبر
//        EncryptedSharedPreferences على Android) عبر @aparajita/capacitor-secure-storage،
//        مخصّص لتوكن الدخول (JWT) تحديدًا — لا يوجد ما يعادله على الويب، فنستخدم
//        localStorage هناك كما كان الحال دائمًا (لا تراجع أمني عن الوضع الحالي).
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

let PreferencesPromise = null;
let SecureStoragePromise = null;
function getPreferences() {
  if (!PreferencesPromise) PreferencesPromise = import("@capacitor/preferences").then((m) => m.Preferences);
  return PreferencesPromise;
}
function getSecureStorage() {
  if (!SecureStoragePromise) SecureStoragePromise = import("@aparajita/capacitor-secure-storage").then((m) => m.SecureStorage);
  return SecureStoragePromise;
}

export async function getPlain(key) {
  if (!isNative) return localStorage.getItem(key);
  const Preferences = await getPreferences();
  const { value } = await Preferences.get({ key });
  return value ?? null;
}
export async function setPlain(key, value) {
  if (!isNative) { localStorage.setItem(key, value); return; }
  const Preferences = await getPreferences();
  await Preferences.set({ key, value });
}
export async function removePlain(key) {
  if (!isNative) { localStorage.removeItem(key); return; }
  const Preferences = await getPreferences();
  await Preferences.remove({ key });
}

export async function getSecure(key) {
  if (!isNative) return localStorage.getItem(key);
  try {
    const SecureStorage = await getSecureStorage();
    return await SecureStorage.get(key);
  } catch {
    return null;
  }
}
export async function setSecure(key, value) {
  if (!isNative) { localStorage.setItem(key, value); return; }
  const SecureStorage = await getSecureStorage();
  await SecureStorage.set(key, value);
}
export async function removeSecure(key) {
  if (!isNative) { localStorage.removeItem(key); return; }
  try {
    const SecureStorage = await getSecureStorage();
    await SecureStorage.remove(key);
  } catch { /* لا شيء لحذفه */ }
}

export { isNative };
