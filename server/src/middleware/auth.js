// FILE: server/src/middleware/auth.js
import jwt from 'jsonwebtoken';

/**
 * ميدلوير يربط PG client بالطلب ويضبط app.user_id من الـJWT.
 * فيه "قائمة سماح" لمسارات لا تحتاج توثيق (/auth/* و /healthz و /readyz).
 */
export default function setUserContext(pool) {
  return async function authMiddleware(req, res, next) {
    // مسارات مفتوحة لا تحتاج توكن
    const open =
      req.path === '/healthz' ||
      req.path === '/readyz' ||
      req.path.startsWith('/auth/');

    // نفتح اتصال PG لكل طلب (اختياري: تقدرين بس للمحمية)
    let client;
    try {
      client = await pool.connect();
    } catch (e) {
      return res.status(503).json({ error: 'db_unavailable', detail: e.message });
    }

    if (open) {
      // للمسارات المفتوحة لا نتحقق توكن ولا نضبط user_id
      req.db = client;
      return next();
    }

    // محمية: لازم Authorization: Bearer <token>
    const auth = req.headers['authorization'] || '';
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) {
      client.release();
      return res.status(401).json({
        error: 'unauthorized',
        detail: 'missing auth (Authorization: Bearer <token>)',
      });
    }

    // نتحقق من الـJWT
    let sub;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      sub = String(payload.sub);
    } catch (e) {
      client.release();
      return res.status(401).json({ error: 'unauthorized', detail: e.message || 'jwt invalid' });
    }

    try {
      // نضبط user_id في إعدادات الجلسة عشان تشتغل RLS في الاستعلامات
      await client.query(`SELECT set_config('app.user_id', $1, true);`, [sub]);
    } catch (e) {
      client.release();
      return res.status(500).json({ error: 'internal_error', detail: e.message });
    }

    // نمرر العميل للراوتات
    req.db = client;

    // عند انتهاء الرد، تأكد تحرير الاتصال
    const _end = res.end;
    res.end = function (...args) {
      try { client.release(); } catch {}
      return _end.call(this, ...args);
    };

    next();
  };
}
