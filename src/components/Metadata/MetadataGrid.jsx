import MetadataSection from "./MetadataSection";

export default function MetadataGrid({
  title,
  description,
  type,
  items = [],
}) {
  if (!items.length) {
    return null;
  }

  return (
    <MetadataSection
      title={title}
      description={description}
      type={type}
      count={items.length}
    >
      <div className="metadata-grid">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={`metadata-grid-item ${
              item.sensitive ? "sensitive" : ""
            }`}
          >
            <span className="metadata-grid-label">
              {item.label}
            </span>

            <span className="metadata-grid-value">
              {String(item.value)}
            </span>
          </div>
        ))}
      </div>
    </MetadataSection>
  );
}