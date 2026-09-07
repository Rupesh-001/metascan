import MetadataSection from "./MetadataSection";

export default function RawMetadataSection({
  metadata = {},
}) {
  const entries = Object.entries(
    metadata
  );

  if (!entries.length) {
    return null;
  }

  return (
    <MetadataSection
      title="Raw Metadata"
      description="Complete metadata payload extracted from the file."
      type="raw"
      count={entries.length}
    >
      <div className="raw-metadata-container">
        <div className="raw-metadata-header">
          <span>
            COMPLETE METADATA OBJECT
          </span>
        </div>

        <pre className="raw-metadata-code">
          {JSON.stringify(
            metadata,
            null,
            2
          )}
        </pre>
      </div>
    </MetadataSection>
  );
}