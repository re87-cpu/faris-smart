// FILE: src/api/employees.js
import { http } from "../utils/http.js";

export async function fetchEmployees() {
  try {
    const res = await http("GET", "/employees");
    return Array.isArray(res) ? res : [];
  } catch (e) {
    // 403 للموظف شيء طبيعي — نسكت ونرجع []
    const msg = String(e?.message || "");
    if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
      return [];
    }
    return [];
  }
}
