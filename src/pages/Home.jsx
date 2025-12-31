import { Link } from "react-router-dom";

export default function Home(){
  return (
    <>
      {/* Hero */}
      <section className="hero section">
        <div className="container">
          <h1 className="h1">شركة الفارس ترحب بكم</h1>
          <p className="muted" style={{marginBottom: 18}}>
            واجهة الفارس الذكية لإدارة القضايا القانونية — تصميم رسمي بسيط على نمط "قانونية".
          </p>

          {/* البحث الشامل */}
          <div className="card" style={{display:"flex", gap:12, alignItems:"center"}}>
            <input className="input" placeholder="ابحث برقم القضية أو باسم الطرف..." />
            <button className="btn btn-primary">بحث</button>
            <Link className="btn btn-outline" to="/cases">عرض القضايا</Link>
          </div>

          {/* روابط سريعة */}
          <div className="grid grid-4" style={{marginTop:16}}>
            <Link className="card" to="/cases/new">
              <div className="h2" style={{color:"var(--brand)"}}>إضافة قضية</div>
              <div className="muted">إدخال قضية جديدة (للمدير)</div>
            </Link>
            <Link className="card" to="/cases">
              <div className="h2" style={{color:"var(--brand)"}}>جميع القضايا</div>
              <div className="muted">استعراض وترشيح وفرز</div>
            </Link>
            <Link className="card" to="/calendar">
              <div className="h2" style={{color:"var(--brand)"}}>التقويم</div>
              <div className="muted">جلسات ومواعيد وملفات زمنية</div>
            </Link>
            <Link className="card" to="/archive">
              <div className="h2" style={{color:"var(--brand)"}}>الأرشيف</div>
              <div className="muted">بحث داخل الأرشيف + OCR</div>
            </Link>
          </div>
        </div>
      </section>

      {/* مميزات متقدمة للموظفين */}
      <section className="section">
        <div className="container">
          <h2 className="h2">مميزات متقدمة للموظفين</h2>
          <div className="grid grid-4">
            <div className="card"><b>قوالب قانونية ذكية</b><div className="muted">عقود/مذكرات/مرافعات بمتغيّرات جاهزة</div></div>
            <div className="card"><b>ملخص الجلسة إلزامي</b><div className="muted">لا تُغلق الجلسة قبل كتابة الملخّص</div></div>
            <div className="card"><b>تنبيهات حسّاسة</b><div className="muted">جلسات/مهل/تعـارض/تصعيد للمدير</div></div>
            <div className="card"><b>بحث وفهرسة</b><div className="muted">تصفية وحفظ مناظير + OCR للأرشيف</div></div>
          </div>
        </div>
      </section>

      {/* من هو المؤسس */}
      <section className="section">
        <div className="container">
          <h2 className="h2">من هو مؤسس الشركة</h2>
          <div className="card">
            الأستاذ فارس محمد الغامدي — رؤية قانونية تُبسّط العمل اليومي وتسرّع إنجاز المذكرات والجلسات.
          </div>
        </div>
      </section>

      {/* ما هو القانون + العدل ومخافة الله + روابط إرشادية */}
      <section className="section">
        <div className="container grid grid-3">
          <div className="card">
            <h3 className="h2">ما هو القانون؟</h3>
            <div className="muted">منظومة قواعد تُنظّم حياة الناس وتحقق العدالة.</div>
          </div>
          <div className="card">
            <h3 className="h2">العدل ومخافة الله</h3>
            <div className="muted">“اتقوا الله في أعمالكم، فإن العدل أساس الملك.”</div>
          </div>
          <div className="card">
            <h3 className="h2">روابط إرشادية (هيئة الخبراء)</h3>
            <div className="links-grid">
              <a className="btn btn-outline" target="_blank" rel="noreferrer"
                 href="https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/655fdb42-8c96-422b-b8c4-b04f0095c94c/1">نظام المعاملات المدنية</a>
              <a className="btn btn-outline" target="_blank" rel="noreferrer"
                 href="https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/f0eaae46-9f84-40ee-815e-a9a700f268b3/1">نظام المرافعات الشرعية</a>
              <a className="btn btn-outline" target="_blank" rel="noreferrer"
                 href="https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/2716057c-c097-4bad-8e1e-ae1400c678d5/1">نظام الإثبات</a>
              <a className="btn btn-outline" target="_blank" rel="noreferrer"
                 href="https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/8f1b7079-a5f0-425d-b5e0-a9a700f26b2d/1">نظام الإجراءات الجزائية</a>
              <a className="btn btn-outline" target="_blank" rel="noreferrer"
                 href="https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/38334008-3b70-4c6c-b3af-aba3016a8061/1">نظام المحاكم التجارية</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
