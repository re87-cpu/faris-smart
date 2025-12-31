export default function DownloadTemplateButton({ templateName }) {
  return (
    <a
      href={`/templates/${templateName}`}
      download
      className="q-btn primary"
    >
      تحميل قالب Word
    </a>
  );
}
