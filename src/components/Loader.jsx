// FILE: src/components/Loader.jsx
import React from "react";

export default function Loader({ text = "جارٍ التحميل..." }) {
  return (
    <div className="q-loader" role="status" aria-live="polite">
      <span className="q-spinner" aria-hidden />
      <span>{text}</span>
    </div>
  );
}
