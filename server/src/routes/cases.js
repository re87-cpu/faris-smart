// FILE: server/src/routes/cases.js
import jwt from "jsonwebtoken";

function requireAuth(req) {
  const auth = req.headers["authorization"] || "";
  const [, token] = auth.split(" ");
  if (!token) {
    const err = new Error("unauthorized");
    err.status = 401;
    throw err;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET); // {sub: userId}
  } catch (e) {
    const err = new Error("unauthorized");
    err.status = 401;
    throw err;
  }
}

async function requireManager(client, userId) {
  const { rows } = await client.query(
    `SELECT role FROM app.users WHERE id=$1 LIMIT 1`,
    [String(userId)]
  );
  if (!rows.length || rows[0].role !== "manager") {
    const err = new Error("forbidden");
    err.status = 403;
    throw err;
  }
}

export default function mountCasesRoutes(app, pool) {
  // ✅ حذف نهائي للقضية (Manager فقط)
  app.delete("/cases/:id", async (req, res) => {
    const client = await pool.connect();
    try {
      const payload = requireAuth(req);
      await requireManager(client, payload.sub);

      const id = String(req.params.id || "").trim();
      if (!id) return res.status(400).json({ error: "case_id_required" });

      // (اختياري) احذف الجداول المرتبطة قبل القضية إذا ما عندك ON DELETE CASCADE
      // await client.query(`DELETE FROM app.case_notes WHERE case_id=$1`, [id]);
      // await client.query(`DELETE FROM app.case_docs WHERE case_id=$1`, [id]);
      // await client.query(`DELETE FROM app.sessions WHERE case_id=$1`, [id]);

      const del = await client.query(
        `DELETE FROM app.cases WHERE id=$1 RETURNING id`,
        [id]
      );

      if (!del.rows.length) return res.status(404).json({ error: "not_found" });

      return res.json({ ok: true, id: del.rows[0].id });
    } catch (e) {
      return res.status(e.status || 500).json({ error: e.message });
    } finally {
      client.release();
    }
  });
}
