// FILE: src/data/financialSeed.js
// أدوات مالية مشتركة بين صفحة المالية وملخص الرئيسية — حتى تُحسب الأرقام
// بنفس الطريقة في الاثنين. البيانات نفسها تأتي الآن من الـ API الفعلي
// (/financial/transactions)، لا بيانات تجريبية هنا.
export const fmtMoney = (n) => Math.round(n).toLocaleString("en-US");
export const typeLabels = { income: "إيراد", expense: "مصروف", due: "مستحق" };

export function financialTotals(tx) {
  const totalIncome = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalDue = tx.filter((t) => t.type === "due").reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpense, totalDue, net: totalIncome - totalExpense };
}
