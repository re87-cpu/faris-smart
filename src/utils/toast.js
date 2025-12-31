// FILE: src/utils/toast.js
export function toast(msg){
  const el = document.createElement("div");
  el.className = "q-alert";
  el.style.cssText = "position:fixed;bottom:18px;right:18px;max-width:360px;z-index:9999;transition:all .3s";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transform="translateY(8px)"; }, 1800);
  setTimeout(()=> el.remove(), 2300);
}
