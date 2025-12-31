// قراءة UUID من الهيدر X-User-Id (بدون أي شيء وهمي)
export function getUserIdFromRequest(req) {
  const uid = req.header('X-User-Id');
  if (!uid) {
    const err = new Error('missing user id');
    err.status = 401;
    throw err;
  }
  const uuidLike =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidLike.test(uid)) {
    const err = new Error('invalid user id format (expect UUID)');
    err.status = 400;
    throw err;
  }
  return uid;
}
