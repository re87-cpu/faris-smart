 // FILE: src/utils/api.js
// ✅ Shortcut / Shim
// هدفه: أي كود قديم يستورد api ما يتكسر
// يعتمد على http.js (اللي فيه توكن موحّد)

import { http } from "./http.js";

export const api = {
  get: (p, opts) => http("GET", p, opts?.body),
  post: (p, body) => http("POST", p, body),
  put: (p, body) => http("PUT", p, body),
  del: (p, opts) => http("DELETE", p, opts?.body),
};
