// FILE: src/api/_token.js
// أدوات التوكن الداخلية — غير مُستخدمة خارج طبقة الـ API

export function saveToken(token) {
  if (!token) return;

  // خزّنيه كنص خام (أفضل وأبسط)
  localStorage.setItem("token", token);
  localStorage.setItem("faris_token", token);
  localStorage.setItem("fs_auth_v1", token);

  // للتوافق إذا عندك كود قديم يقرأ auth كـ JSON
  localStorage.setItem("auth", JSON.stringify({ token }));
}

// ✅ قراءة التوكن من أي مكان بدون ما نخرب بسبب JSON.parse
export function getTokenAny() {
  // أولاً: المفاتيح المباشرة (نص خام)
  const direct =
    localStorage.getItem("faris_token") ||
    localStorage.getItem("fs_auth_v1") ||
    localStorage.getItem("token");

  if (direct && typeof direct === "string") {
    const t = direct.trim();
    // لو كان "eyJ..." بس داخل اقتباسات (قديم) نشيله
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      return t.slice(1, -1);
    }
    // لو كان JSON نصي بالغلط
    if (t.startsWith("{")) {
      try {
        const obj = JSON.parse(t);
        const tok = obj?.token || obj?.accessToken || null;
        if (tok) return String(tok);
      } catch (e) {
        // ignore
      }
    }
    // النص الخام JWT
    return t;
  }

  // ثانيًا: auth كـ JSON { token }
  const authRaw = localStorage.getItem("auth");
  if (authRaw && typeof authRaw === "string") {
    try {
      const obj = JSON.parse(authRaw);
      const tok = obj?.token || obj?.accessToken || null;
      if (tok) return String(tok).trim();
    } catch (e) {
      // ignore
    }
  }

  return null;
}
