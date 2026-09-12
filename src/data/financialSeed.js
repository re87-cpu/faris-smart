// FILE: src/data/financialSeed.js
// بيانات مالية تجريبية مشتركة بين صفحة المالية وملخص الرئيسية — حتى تبقى
// الأرقام متطابقة بين الاثنين. لا يوجد API مالي بعد؛ لما يتوفر، هذا الملف
// يُستبدل بجلب حقيقي وتختفي الحاجة له.
export const seedTx = [
  { type: "income", amount: 28000, caseId: "C-0142", caseLabel: "شركة الأفق التجارية", date: "2026-09-01", desc: "دفعة أولى — تقاضٍ تجاري" },
  { type: "income", amount: 6500, caseId: "C-0151", caseLabel: "مؤسسة نجد للمقاولات", date: "2026-09-02", desc: "أتعاب استشارة" },
  { type: "due", amount: 4000, caseId: "C-0151", caseLabel: "مؤسسة نجد للمقاولات", date: "2026-09-02", desc: "دفعة متبقية" },
  { type: "income", amount: 15200, caseId: "C-0138", caseLabel: "مؤسسة البناء الحديث", date: "2026-09-03", desc: "أتعاب قضية عمالية" },
  { type: "income", amount: 9800, caseId: "C-0146", caseLabel: "شركة المدى للتجارة", date: "2026-09-04", desc: "مراجعة عقد" },
  { type: "due", amount: 3200, caseId: "C-0146", caseLabel: "شركة المدى للتجارة", date: "2026-09-04", desc: "دفعة متبقية" },
  { type: "income", amount: 125000, caseId: "", caseLabel: "", date: "2026-09-05", desc: "إيرادات متفرقة أخرى" },
  { type: "expense", amount: 38000, caseId: "", caseLabel: "", date: "2026-09-01", desc: "رواتب الفريق" },
  { type: "expense", amount: 12300, caseId: "", caseLabel: "", date: "2026-09-02", desc: "إيجار المكتب" },
  { type: "expense", amount: 12000, caseId: "", caseLabel: "", date: "2026-09-03", desc: "مصاريف تشغيلية" },
];

export const fmtMoney = (n) => Math.round(n).toLocaleString("en-US");
export const typeLabels = { income: "إيراد", expense: "مصروف", due: "مستحق" };

export function financialTotals(tx) {
  const totalIncome = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalDue = tx.filter((t) => t.type === "due").reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpense, totalDue, net: totalIncome - totalExpense };
}
