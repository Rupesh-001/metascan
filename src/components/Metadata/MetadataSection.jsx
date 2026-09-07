import {
  Camera,
  Crosshair,
  CalendarDays,
  MapPin,
  Monitor,
  UserRound,
  Code2,
  Database,
} from "lucide-react";

const SECTION_ICONS = {
  camera: Camera,
  exposure: Crosshair,
  dates: CalendarDays,
  location: MapPin,
  software: Monitor,
  personal: UserRound,
  xmp: Code2,
  raw: Database,
};

export default function MetadataSection({
  title,
  description,
  type = "raw",
  children,
  count,
}) {
  const Icon =
    SECTION_ICONS[type] || Database;

  return (
    <section className="metadata-section">
      <div className="metadata-section-header">
        <div className="metadata-section-icon">
          <Icon size={17} />
        </div>

        <div className="metadata-section-heading">
          <div className="metadata-section-title-row">
            <h3>{title}</h3>

            {count !== undefined && (
              <span className="metadata-section-count">
                {count}
              </span>
            )}
          </div>

          {description && (
            <p>{description}</p>
          )}
        </div>
      </div>

      <div className="metadata-section-content">
        {children}
      </div>
    </section>
  );
}