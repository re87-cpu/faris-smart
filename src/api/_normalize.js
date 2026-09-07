// FILE: src/api/_normalize.js
// دوال توحيد الحقول الداخلية — مشتركة بين وحدات الـ API

export function buildEmpById(emps) {
  var map = {};
  if (Array.isArray(emps)) {
    for (var i = 0; i < emps.length; i++) {
      var e = emps[i];
      map[String(e.id)] = e;
    }
  }
  return map;
}

export function normalizeCaseRow(row, empById) {
  row = row || {};

  var assigned =
    row.assignedTo !== undefined ? row.assignedTo :
    row.assigned_to !== undefined ? row.assigned_to :
    row.assignedToId !== undefined ? row.assignedToId :
    row.assigned_to_id !== undefined ? row.assigned_to_id :
    null;

  var assignedTo = (assigned !== null && assigned !== undefined && String(assigned).trim() !== "")
    ? String(assigned)
    : null;

  var emp = (assignedTo && empById) ? empById[String(assignedTo)] : null;

  var assignedName =
    row.assignedName !== undefined ? row.assignedName :
    row.assigned_name !== undefined ? row.assigned_name :
    (emp ? (emp.full_name || emp.name || emp.email) : null);

  return {
    // الأصل
    id: row.id,
    case_number: row.case_number || row.caseNumber || row.no || null,
    title: row.title || "",
    status: row.status || "",
    court: row.court || "",
    next: row.next || null,

    // تواريخ
    created_at: row.created_at || row.createdAt || null,
    updated_at: row.updated_at || row.updatedAt || null,
    createdAt: row.createdAt || row.created_at || null,
    updatedAt: row.updatedAt || row.updated_at || null,

    // إسناد
    assignedTo: assignedTo,
    assigned_to:
      row.assigned_to !== undefined
        ? row.assigned_to
        : (assignedTo ? Number(assignedTo) : null),

    assignedName: assignedName || null,
    assigned_name:
      row.assigned_name !== undefined
        ? row.assigned_name
        : (assignedName || null),

    // حقول إضافية
    assignNote: row.assignNote || row.assign_note || null,
    assignedAt: row.assignedAt || row.assigned_at || null,
  };
}

export function normalizeMyTask(t) {
  t = t || {};
  return {
    id: t.id,
    title: t.title || "",
    done: !!t.done,
    due: t.due !== undefined ? t.due : (t.due_at !== undefined ? t.due_at : (t.dueAt !== undefined ? t.dueAt : null)),
    dueAt: t.dueAt !== undefined ? t.dueAt : (t.due_at !== undefined ? t.due_at : (t.due !== undefined ? t.due : null)),
    createdAt: t.createdAt || t.created_at || null,
    updatedAt: t.updatedAt || t.updated_at || null,
  };
}

export function normalizeArticle(a) {
  a = a || {};
  return {
    id: a.id,
    title: a.title || "",
    content: a.content || a.body || "",
    status: a.status || "pending", // pending | published | rejected
    authorId: a.authorId || a.author_id || null,
    authorName: a.authorName || a.author_name || a.author || "",
    createdAt: a.createdAt || a.created_at || null,
    publishedAt: a.publishedAt || a.published_at || null,
    updatedAt: a.updatedAt || a.updated_at || null,
  };
}

export function toArray(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.rows)) return res.rows;
  return [];
}
