export default function Dashboard() {
  const bestEmployee = {
    name: "أمل العتيبي",
    title: "أفضل موظف لهذا الشهر",
    reason: "لتميزها في متابعة القضايا وإنجاز المهام بسرعة واحترافية.",
    image: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
  };

  const advice = "اتقِ الله في السر والعلن، فمن راقب الله في عمله وفّقه الله في مسعاه.";
  const motivation = "كل جهد تبذله في خدمة العدالة يُكتب لك أثره في ميزان عملك.";

  return (
    <div dir="rtl" style={{
      background: "#ffffff",
      color: "#111",
      fontFamily: "Tajawal, sans-serif",
      minHeight: "100vh",
      padding: "40px 0"
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
        {/* الترحيب */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#0050FF", fontSize: "36px", marginBottom: "8px" }}>
            مرحبًا بك في واجهة الفارس الذكية
          </h1>
          <p style={{ color: "#666", fontSize: "18px" }}>
            نظام إدارة القضايا والموظفين - بإشراف أ. فارس
          </p>
        </div>

        {/* أفضل موظف */}
        <div style={{
          background: "#f5f8ff",
          border: "1px solid #dce6ff",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "40px",
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}>
          <img
            src={bestEmployee.image}
            alt="أفضل موظف"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid #0050FF"
            }}
          />
          <div>
            <h2 style={{ color: "#0050FF", margin: "0 0 8px" }}>{bestEmployee.title}</h2>
            <h3 style={{ margin: "0 0 8px" }}>{bestEmployee.name}</h3>
            <p style={{ color: "#444", margin: 0 }}>{bestEmployee.reason}</p>
          </div>
        </div>

        {/* نصيحة دينية */}
        <div style={{
          background: "#fafafa",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          border: "1px solid #eee",
          marginBottom: "30px"
        }}>
          <h3 style={{ color: "#0050FF", marginBottom: "10px" }}>نصيحة دينية</h3>
          <p style={{ color: "#333", fontSize: "18px", lineHeight: 1.8 }}>{advice}</p>
        </div>

        {/* رسالة تحفيزية */}
        <div style={{
          background: "#f0f4ff",
          border: "1px solid #dce6ff",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "40px"
        }}>
          <h3 style={{ color: "#0050FF", marginBottom: "10px" }}>كلمة تحفيزية</h3>
          <p style={{ color: "#333", fontSize: "17px" }}>{motivation}</p>
        </div>

        {/* أزرار الدخول */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px"
        }}>
          <button
            style={{
              background: "#0050FF",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={() => alert("فتح لوحة المدير")}
          >
            لوحة المدير
          </button>

          <button
            style={{
              background: "#fff",
              color: "#0050FF",
              border: "2px solid #0050FF",
              borderRadius: "10px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={() => alert("فتح لوحة الموظف")}
          >
            لوحة الموظف
          </button>
        </div>
      </div>
    </div>
  );
}
