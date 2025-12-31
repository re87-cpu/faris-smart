// FILE: server/src/routes/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default function mountAuthRoutes(app, pool) {
  // 1) تسجيل الدخول
  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT id, email, role, is_active, password_hash
           FROM app.users
          WHERE lower(email) = lower($1)
          LIMIT 1`,
        [email]
      );
      if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });

      const u = rows[0];
      if (!u.is_active) return res.status(403).json({ error: 'account_inactive' });

      if (!u.password_hash) return res.status(401).json({ error: 'invalid credentials' });
      const ok = await bcrypt.compare(password, u.password_hash);
      if (!ok) return res.status(401).json({ error: 'invalid credentials' });

      const token = jwt.sign({ sub: u.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, user: { id: u.id, email: u.email, role: u.role } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  // 2) تسجيل موظف جديد (طلب حساب) — لا يحتاج توكن
  app.post('/auth/register', async (req, res) => {
    const { full_name, email, password } = req.body || {};
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email, password are required' });
    }
    const client = await pool.connect();
    try {
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await client.query(
        `INSERT INTO app.users (full_name, email, role, is_active, password_hash)
         VALUES ($1, lower($2), 'staff', false, $3)
         ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash
         RETURNING id, full_name, email, role, is_active`,
        [full_name, email, hash]
      );
      // هنا ممكن لاحقًا نرسل إشعار للمدير (إيميل) بأنه فيه طلب جديد.
      res.status(201).json({ status: 'pending', user: rows[0] });
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  // 3) موافقة المدير على موظف — تحتاج توكن مدير
  app.post('/auth/approve', async (req, res) => {
    const auth = req.headers['authorization'] || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    let sub;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      sub = String(payload.sub);
    } catch (e) {
      return res.status(401).json({ error: 'unauthorized', detail: e.message });
    }

    const { user_id } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const client = await pool.connect();
    try {
      // تحقّق أن المستدعي مدير
      const mgr = await client.query(
        `SELECT role FROM app.users WHERE id = $1 LIMIT 1`,
        [sub]
      );
      if (!mgr.rows.length || mgr.rows[0].role !== 'manager') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // فعّل الحساب
      const upd = await client.query(
        `UPDATE app.users
            SET is_active = true
          WHERE id = $1
       RETURNING id, full_name, email, role, is_active`,
        [user_id]
      );
      if (!upd.rows.length) return res.status(404).json({ error: 'user_not_found' });

      res.json({ ok: true, user: upd.rows[0] });
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });
}

<Route path="/register" element={<Register />} />
