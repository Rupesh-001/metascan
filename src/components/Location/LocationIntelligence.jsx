import {
  AlertTriangle,
  ExternalLink,
  MapPin,
  Navigation,
  Mountain,
} from "lucide-react";

import {
  createMapURL,
  formatDecimalCoordinates,
  formatLatitude,
  formatLongitude,
  getGPSCoordinates,
} from "../../utils/formatCoordinates";

export default function LocationIntelligence({
  metadata,
}) {
  const coordinates =
    getGPSCoordinates(metadata);

  if (!coordinates) {
    return (
      <section className="location-panel location-clear">
        <div className="location-header">
          <div className="location-icon">
            <MapPin size={20} />
          </div>

          <div>
            <span>LOCATION INTELLIGENCE</span>

            <h2>
              No GPS Location Detected
            </h2>
          </div>
        </div>

        <div className="location-clear-message">
          <div className="location-clear-icon">
            <MapPin size={18} />
          </div>

          <div>
            <strong>
              No geographic coordinates found
            </strong>

            <p>
              MetaScan did not detect usable GPS
              latitude or longitude values in the
              extracted metadata.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const mapURL = createMapURL(
    coordinates.latitude,
    coordinates.longitude
  );

  const altitude =
    metadata.GPSAltitude ??
    metadata.Altitude ??
    metadata.gpsAltitude;

  const direction =
    metadata.GPSImgDirection ??
    metadata.GPSDirection ??
    metadata.ImageDirection;

  const gpsDate =
    metadata.GPSDateStamp ??
    metadata.GPSDateTime ??
    metadata.GPSTimeStamp;

  return (
    <section className="location-panel location-detected">
      <div className="location-header">
        <div className="location-icon danger">
          <MapPin size={20} />
        </div>

        <div className="location-title">
          <span>LOCATION INTELLIGENCE</span>

          <h2>
            GPS Location Detected
          </h2>

          <p>
            This file contains geographic
            information that may reveal where
            it was captured.
          </p>
        </div>

        <div className="location-risk">
          HIGH RISK
        </div>
      </div>

      <div className="location-warning">
        <AlertTriangle size={17} />

        <div>
          <strong>
            Privacy-sensitive geographic data found
          </strong>

          <p>
            Anyone who can access this metadata may
            be able to determine the approximate
            physical location associated with the file.
          </p>
        </div>
      </div>

      <div className="coordinates-card">
        <div className="coordinates-heading">
          <Navigation size={16} />

          <span>
            GPS COORDINATES
          </span>
        </div>

        <div className="coordinates-value">
          {formatDecimalCoordinates(
            coordinates.latitude,
            coordinates.longitude
          )}
        </div>

        <div className="coordinates-grid">
          <div>
            <span>LATITUDE</span>

            <strong>
              {formatLatitude(
                coordinates.latitude
              )}
            </strong>
          </div>

          <div>
            <span>LONGITUDE</span>

            <strong>
              {formatLongitude(
                coordinates.longitude
              )}
            </strong>
          </div>
        </div>

        {mapURL && (
          <a
            className="map-button"
            href={mapURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={15} />

            Open Location on Map

            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {(altitude !== undefined ||
        direction !== undefined ||
        gpsDate !== undefined) && (
        <div className="gps-extra-data">
          {altitude !== undefined && (
            <div className="gps-extra-item">
              <Mountain size={15} />

              <div>
                <span>ALTITUDE</span>

                <strong>
                  {formatAltitude(altitude)}
                </strong>
              </div>
            </div>
          )}

          {direction !== undefined && (
            <div className="gps-extra-item">
              <Navigation size={15} />

              <div>
                <span>DIRECTION</span>

                <strong>
                  {formatDirection(
                    direction
                  )}
                </strong>
              </div>
            </div>
          )}

          {gpsDate !== undefined && (
            <div className="gps-extra-item">
              <MapPin size={15} />

              <div>
                <span>GPS TIMESTAMP</span>

                <strong>
                  {formatGPSDate(
                    gpsDate
                  )}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="location-disclaimer">
        <span>ⓘ</span>

        <p>
          MetaScan reports the coordinates embedded
          in the file. The displayed map service may
          provide additional location information.
        </p>
      </div>
    </section>
  );
}

function formatAltitude(value) {
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `${number.toFixed(2)} m`;
}

function formatDirection(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `${number.toFixed(2)}°`;
}

function formatGPSDate(value) {
  if (Array.isArray(value)) {
    return value.join(":");
  }

  return String(value);
}