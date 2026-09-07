import { useState } from "react";
import { jsPDF } from "jspdf";

import { reverseGeocode } from "./services/geocodingService";

import {
  ShieldCheck,
  Upload,
  FileSearch,
  Lock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FileText,
  Image as ImageIcon,
  X,
  Fingerprint,
  RefreshCw,
  ChevronDown,
  Database,
  Download,
  ScanLine,
  FileCheck2,
  ShieldAlert,
  Navigation,
  Mountain,
  ExternalLink,
} from "lucide-react";

import { useFileAnalysis } from "./hooks/useFileAnalysis";

import ImageMetadataSections from "./components/Metadata/ImageMetadataSections";

import {
  getGPSCoordinates,
  formatLatitude,
  formatLongitude,
  formatDecimalCoordinates,
  createMapURL,
} from "./utils/formatCoordinates";

import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const {
    result,
    loading,
    error,
    analyze,
    reset,
  } = useFileAnalysis();

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setScanStage(0);
    setIsScanning(false);

    reset();
  };

  const handleInputChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setScanStage(0);
    setIsScanning(false);

    reset();
  };

  const analyzeCurrentFile = async () => {
    if (!file || loading || isScanning) {
      return;
    }

    setIsScanning(true);
    setScanStage(0);

    const startTime = Date.now();

    const stageTimers = [
      setTimeout(() => {
        setScanStage(1);
      }, 650),

      setTimeout(() => {
        setScanStage(2);
      }, 1300),

      setTimeout(() => {
        setScanStage(3);
      }, 1950),

      setTimeout(() => {
        setScanStage(4);
      }, 2600),

      setTimeout(() => {
        setScanStage(5);
      }, 3250),
    ];

    const minimumScanTime = 4200;

    try {
      await analyze(file);

      const elapsed =
        Date.now() - startTime;

      const remaining = Math.max(
        minimumScanTime - elapsed,
        0
      );

      await new Promise((resolve) => {
        setTimeout(
          resolve,
          remaining
        );
      });

      setScanStage(5);

      await new Promise((resolve) => {
        setTimeout(
          resolve,
          450
        );
      });
    } finally {
      stageTimers.forEach(clearTimeout);

      setIsScanning(false);
    }
  };

  const showScanner =
    isScanning || loading;

  const showResults =
    Boolean(result) && !showScanner;

  return (
    <div className="app">
      {/* HEADER */}

      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <div className="brand-name">
              MetaScan
            </div>

            <div className="brand-subtitle">
              Metadata & Privacy Analyzer
            </div>
          </div>
        </div>

        <div className="privacy-status">
          <span className="status-dot" />

          <span>
            LOCAL PROCESSING
          </span>

          <Lock size={14} />
        </div>
      </header>

      {/* MAIN */}

      <main className="main">
        {/* HERO */}

        <section className="hero">
          <div className="eyebrow">
            <FileSearch size={15} />

            DIGITAL FORENSICS UTILITY
          </div>

          <h1>
            Discover what your
            <span> files reveal.</span>
          </h1>

          <p>
            Analyze hidden metadata, location
            information, device details,
            timestamps, and privacy-sensitive
            data directly in your browser.
          </p>
        </section>

        {/* UPLOAD / SCANNER */}

        {!showResults && (
          <>
            <section className="upload-card">
              {!file ? (
                <div
                  className={`dropzone ${
                    dragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();

                    setDragging(true);
                  }}
                  onDragLeave={() => {
                    setDragging(false);
                  }}
                  onDrop={handleDrop}
                >
                  <input
                    id="file-upload"
                    type="file"
                    hidden
                    onChange={
                      handleInputChange
                    }
                    accept="
                      .jpg,
                      .jpeg,
                      .png,
                      .webp,
                      .heic,
                      .heif,
                      .avif,
                      .tif,
                      .tiff,
                      .pdf,
                      .docx
                    "
                  />

                  <div className="upload-icon">
                    <Upload size={30} />
                  </div>

                  <h2>
                    Drop your file here
                  </h2>

                  <p>
                    or{" "}
                    <label htmlFor="file-upload">
                      browse your device
                    </label>
                  </p>

                  <div className="supported-types">
                    <span>JPG</span>
                    <span>PNG</span>
                    <span>WEBP</span>
                    <span>HEIC</span>
                    <span>PDF</span>
                    <span>DOCX</span>
                  </div>
                </div>
              ) : showScanner ? (
                <ScanningBox
                  file={file}
                  scanStage={scanStage}
                />
              ) : (
                <div className="selected-file">
                  <div className="selected-file-icon">
                    {file.type.startsWith(
                      "image/"
                    ) ? (
                      <ImageIcon size={28} />
                    ) : (
                      <FileText size={28} />
                    )}
                  </div>

                  <div className="selected-file-info">
                    <span className="selected-label">
                      FILE READY FOR ANALYSIS
                    </span>

                    <h3>
                      {file.name}
                    </h3>

                    <p>
                      {formatFileSize(
                        file.size
                      )}

                      <span>•</span>

                      {file.type ||
                        "Unknown type"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={
                      removeFile
                    }
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>

                  <button
                    type="button"
                    className="analyze-button"
                    onClick={
                      analyzeCurrentFile
                    }
                    disabled={
                      loading ||
                      isScanning
                    }
                  >
                    <ScanLine size={16} />

                    Analyze File
                  </button>
                </div>
              )}
            </section>

            {/* PRIVACY BANNER */}

            <section className="privacy-banner">
              <div className="privacy-banner-icon">
                <Lock size={18} />
              </div>

              <div>
                <strong>
                  Your file stays private
                </strong>

                <p>
                  MetaScan processes files
                  locally in your browser.
                  Files are not uploaded to a
                  server.
                </p>
              </div>

              <CheckCircle2
                className="privacy-check"
                size={20}
              />
            </section>

            {/* ERROR */}

            {error &&
              !showScanner && (
                <div className="analysis-error">
                  <AlertTriangle
                    size={18}
                  />

                  <div>
                    <strong>
                      Analysis failed
                    </strong>

                    <p>
                      {error}
                    </p>
                  </div>
                </div>
              )}
          </>
        )}

        {/* RESULTS */}

        {showResults && (
          <AnalysisResult
            result={result}
            onReset={
              removeFile
            }
          />
        )}

        {/* DASHBOARD */}

        {!file && (
          <section className="preview-dashboard">
            <div className="section-heading">
              <div>
                <span>
                  ANALYSIS DASHBOARD
                </span>

                <h2>
                  Metadata Intelligence
                </h2>
              </div>

              <div className="dashboard-status">
                <span />

                Waiting for file
              </div>
            </div>

            <div className="dashboard-grid">
              <DashboardCard
                icon={
                  <FileSearch size={20} />
                }
                title="File Information"
                description="Name, type, size, timestamps and file properties."
              />

              <DashboardCard
                icon={
                  <ImageIcon size={20} />
                }
                title="Image Metadata"
                description="EXIF, camera, lens, exposure and image details."
              />

              <DashboardCard
                icon={
                  <MapPin size={20} />
                }
                title="Location Data"
                description="GPS coordinates, altitude and location information."
              />

              <DashboardCard
                icon={
                  <AlertTriangle size={20} />
                }
                title="Privacy Analysis"
                description="Identify potentially sensitive information."
              />
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}

      <footer className="footer">
        <div>
          <strong>
            MetaScan
          </strong>

          <span>
            {" "}
            •{" "}
          </span>

          Client-side metadata analysis
        </div>

        <div className="footer-security">
          <Lock size={13} />

          Privacy First
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   SCANNING BOX
========================================================= */

function ScanningBox({
  file,
  scanStage,
}) {
  const stages = [
    "Initializing secure analysis",
    "Reading file structure",
    "Extracting metadata",
    "Checking privacy exposure",
    "Building intelligence report",
    "Analysis complete",
  ];

  const currentStage =
    stages[
      Math.min(
        scanStage,
        stages.length - 1
      )
    ];

  const progress = Math.min(
    ((scanStage + 1) /
      stages.length) *
      100,
    100
  );

  return (
    <div className="scanner-box">
      <div className="scanner-grid" />

      <div className="scanner-corners">
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </div>

      <div className="scanner-document">
        <div className="scanner-file-icon">
          {file.type.startsWith(
            "image/"
          ) ? (
            <ImageIcon size={42} />
          ) : (
            <FileText size={42} />
          )}
        </div>

        <div className="scanner-file-name">
          {file.name}
        </div>

        <div className="scanner-file-size">
          {formatFileSize(
            file.size
          )}
        </div>

        <div className="metadata-lines">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="scan-line">
          <div className="scan-line-glow" />
        </div>
      </div>

      <div className="scanner-info">
        <div className="scanner-status">
          <span className="scanner-dot" />

          ANALYSIS IN PROGRESS
        </div>

        <h2>
          {currentStage}
        </h2>

        <p>
          Inspecting{" "}
          <strong>
            {file.name}
          </strong>
        </p>

        <div className="scan-progress">
          <div
            className="scan-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="scan-stage-row">
          <span>
            Stage{" "}
            {Math.min(
              scanStage + 1,
              stages.length
            )}{" "}
            /{" "}
            {stages.length}
          </span>

          <span>
            {Math.min(
              Math.round(
                progress
              ),
              100
            )}
            %
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYSIS RESULT
========================================================= */

function AnalysisResult({
  result,
  onReset,
}) {
  const metadata =
    result?.metadata || {};

  const dimensions =
    result?.image?.dimensions ||
    {};

  const hasMetadata =
    Object.keys(
      metadata
    ).length > 0;

  const privacyFindings =
    getPrivacyFindings(
      metadata
    );

  const detectedCount =
    privacyFindings.filter(
      (finding) =>
        finding.detected
    ).length;

  const privacyAssessment = {
    ...calculatePrivacyScore(privacyFindings),
    findings: privacyFindings,
  };

  const privacyScore = privacyAssessment.score;

  const downloadJSONReport =
    () => {
      const report =
        createReport(
          result
        );

      const blob =
        new Blob(
          [
            JSON.stringify(
              report,
              null,
              2
            ),
          ],
          {
            type: "application/json",
          }
        );

      downloadBlob(
        blob,
        `${removeExtension(
          result.file.name
        )}-metascan-report.json`
      );
    };

  const downloadHTMLReport =
    () => {
      const report =
        createReport(
          result
        );

      const html =
        createHTMLReport(
          report
        );

      const blob =
        new Blob(
          [html],
          {
            type: "text/html",
          }
        );

      downloadBlob(
        blob,
        `${removeExtension(
          result.file.name
        )}-metascan-report.html`
      );
    };

  const downloadPDFReport =
    async () => {
      try {
        const report = createReport(result);
        await createPDFReport(
          report,
          `${removeExtension(
            result.file.name
          )}-metascan-report.pdf`
        );
      } catch (error) {
        console.error(
          "PDF report generation failed:",
          error
        );
      }
    };

  return (
    <section className="results">
      {/* RESULT HEADER */}

      <div className="results-header">
        <div>
          <span className="section-label">
            ANALYSIS COMPLETE
          </span>

          <h2>
            Metadata Intelligence Report
          </h2>

          <p>
            Analysis completed locally.
            No file was uploaded to a
            server.
          </p>
        </div>

        <div className="result-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={
              downloadJSONReport
            }
          >
            <Download size={16} />

            JSON Report
          </button>

          <button
            type="button"
            className="report-button"
            onClick={
              downloadHTMLReport
            }
          >
            <FileCheck2 size={16} />

            Download Report
          </button>

          <button
            type="button"
            className="report-button"
            onClick={
              downloadPDFReport
            }
          >
            <FileText size={16} />

            PDF Report
          </button>
        </div>
      </div>

      {/* COMPLETION */}

      <div className="completion-banner">
        <div className="completion-icon">
          <CheckCircle2 size={22} />
        </div>

        <div>
          <strong>
            Metadata analysis completed
            successfully
          </strong>

          <p>
            {
              Object.keys(
                metadata
              ).length
            }{" "}
            metadata fields discovered
            {" • "}
            {detectedCount} privacy findings
            detected
          </p>
        </div>

        <button
          type="button"
          className="new-analysis-button"
          onClick={onReset}
        >
          <RefreshCw size={14} />

          New Analysis
        </button>
      </div>

      {/* FILE CARD */}

      <div className="result-file-card">
        <div className="result-file-icon">
          {result.file.category ===
          "image" ? (
            <ImageIcon size={25} />
          ) : (
            <FileText size={25} />
          )}
        </div>

        <div className="result-file-info">
          <span>
            ANALYZED FILE
          </span>

          <h3>
            {result.file.name}
          </h3>

          <p>
            {formatFileSize(
              result.file.size
            )}

            <span>•</span>

            {result.file.type}
          </p>
        </div>

        <div className="result-category">
          {result.file.category.toUpperCase()}
        </div>
      </div>

      {/* FILE + HASH */}

      <div className="result-grid">
        <div className="result-panel">
          <PanelHeader
            icon={
              <FileSearch size={18} />
            }
            title="File Information"
            subtitle="Basic file properties"
          />

          <MetadataRow
            label="File Name"
            value={
              result.file.name
            }
          />

          <MetadataRow
            label="Extension"
            value={
              result.file.extension ||
              "—"
            }
          />

          <MetadataRow
            label="File Size"
            value={formatFileSize(
              result.file.size
            )}
          />

          <MetadataRow
            label="MIME Type"
            value={
              result.file.type
            }
          />

          <MetadataRow
            label="Category"
            value={
              result.file.category
            }
          />

          <MetadataRow
            label="Last Modified"
            value={formatDate(
              result.file
                .lastModifiedDate
            )}
          />
        </div>

        <div className="result-panel">
          <PanelHeader
            icon={
              <Fingerprint size={18} />
            }
            title="File Fingerprint"
            subtitle="Cryptographic integrity identifier"
          />

          <div className="hash-box">
            <span>
              {
                result.hash
                  .algorithm
              }
            </span>

            <code>
              {
                result.hash.value
              }
            </code>
          </div>

          <div className="integrity-note">
            <CheckCircle2 size={16} />

            <span>
              SHA-256 calculated locally
              in your browser.
            </span>
          </div>
        </div>
      </div>

      {/* IMAGE */}

      {result.file.category ===
        "image" && (
        <ImageMetadataResult
          result={result}
        />
      )}

      {/* PDF */}

      {result.file.category ===
        "pdf" && (
        <DocumentMetadataResult
          result={result}
          type="PDF"
        />
      )}

      {/* DOCX */}

      {result.file.category ===
        "docx" && (
        <DocumentMetadataResult
          result={result}
          type="DOCX"
        />
      )}

      {/* GPS */}

      {result.file.category ===
        "image" && (
        <LocationIntelligence
          metadata={
            result.metadata || {}
          }
        />
      )}

      {/* PRIVACY */}

      <section className="privacy-analysis">
        <div className="privacy-analysis-header">
          <div className="privacy-analysis-icon">
            <ShieldAlert size={21} />
          </div>

          <div>
            <span>
              PRIVACY ANALYSIS
            </span>

            <h2>
              Potential Information
              Exposure
            </h2>
          </div>

          <div
            className={`risk-summary ${
              detectedCount > 0
                ? "risk-detected"
                : "risk-clear"
            }`}
          >
            {detectedCount > 0
              ? `${detectedCount} DETECTED`
              : "NO FINDINGS"}
          </div>
        </div>

        <PrivacyScoreCard
          assessment={privacyAssessment}
        />

        <div className="privacy-findings">
          {privacyFindings.map(
            (finding) => (
              <PrivacyFinding
                key={
                  finding.title
                }
                {...finding}
              />
            )
          )}
        </div>
      </section>

      {/* RAW JSON */}

      <details className="raw-json">
        <summary>
          <span>
            <Database size={16} />

            View Raw Analysis Data
          </span>

          <ChevronDown size={16} />
        </summary>

        <pre>
          {JSON.stringify(
            result,
            null,
            2
          )}
        </pre>
      </details>

      {/* DOWNLOAD */}

      <div className="report-download-panel">
        <div className="report-download-icon">
          <FileCheck2 size={22} />
        </div>

        <div className="report-download-content">
          <strong>
            Your metadata report is ready
          </strong>

          <p>
            Export the complete analysis
            for documentation, forensic
            review, or sharing.
          </p>
        </div>

        <div className="report-download-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={
              downloadJSONReport
            }
          >
            <Download size={15} />

            JSON
          </button>

          <button
            type="button"
            className="report-button"
            onClick={
              downloadHTMLReport
            }
          >
            <Download size={15} />

            HTML Report
          </button>

          <button
            type="button"
            className="report-button"
            onClick={
              downloadPDFReport
            }
          >
            <FileText size={15} />

            PDF Report
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   IMAGE METADATA
========================================================= */

function ImageMetadataResult({
  result,
}) {
  const metadata =
    result?.metadata || {};

  const dimensions =
    result?.image?.dimensions || {};

  const hasMetadata =
    Object.keys(metadata).length > 0;

  return (
    <>
      <section className="metadata-panel">
        <PanelHeader
          icon={
            <ImageIcon size={18} />
          }
          title="Image Information"
          subtitle="Image properties detected from the file"
        />

        <div className="metadata-grid">
          <MetadataRow
            label="Width"
            value={
              dimensions.width
                ? `${dimensions.width}px`
                : "Not available"
            }
          />

          <MetadataRow
            label="Height"
            value={
              dimensions.height
                ? `${dimensions.height}px`
                : "Not available"
            }
          />

          <MetadataRow
            label="Orientation"
            value={
              metadata.Orientation ||
              "Not available"
            }
          />

          <MetadataRow
            label="Color Space"
            value={
              metadata.ColorSpace ||
              "Not available"
            }
          />
        </div>
      </section>

      <ImageMetadataSections
        metadata={metadata}
      />

      {!hasMetadata && (
        <section className="metadata-panel">
          <div className="empty-metadata">
            <Database size={24} />

            <strong>
              No readable metadata found
            </strong>

            <p>
              The image does not appear to contain
              metadata that MetaScan could extract.
            </p>
          </div>
        </section>
      )}
    </>
  );
}

/* =========================================================
   PDF / DOCX
========================================================= */

function DocumentMetadataResult({
  result,
  type,
}) {
  const metadata =
    result?.metadata || {};

  const rawMetadata =
    result?.rawMetadata || {};

  const document =
    result?.document || {};

  const hasMetadata =
    Object.keys(
      metadata
    ).length > 0;

  return (
    <>
      <section className="metadata-panel">
        <PanelHeader
          icon={
            <FileText size={18} />
          }
          title={`${type} Information`}
          subtitle={`Document properties detected from the ${type} file`}
        />

        <div className="metadata-grid">
          <MetadataRow
            label="Document Type"
            value={
              document.type ||
              type
            }
          />

          {document.version && (
            <MetadataRow
              label="Version"
              value={
                document.version
              }
            />
          )}

          {document.pages && (
            <MetadataRow
              label="Pages"
              value={
                document.pages
              }
            />
          )}

          {metadata.title && (
            <MetadataRow
              label="Title"
              value={
                metadata.title
              }
            />
          )}

          {metadata.author && (
            <MetadataRow
              label="Author"
              value={
                metadata.author
              }
            />
          )}

          {metadata.subject && (
            <MetadataRow
              label="Subject"
              value={
                metadata.subject
              }
            />
          )}

          {metadata.creator && (
            <MetadataRow
              label="Creator"
              value={
                metadata.creator
              }
            />
          )}

          {metadata.producer && (
            <MetadataRow
              label="Producer"
              value={
                metadata.producer
              }
            />
          )}
        </div>
      </section>

      <MetadataTable
        title="Document Metadata"
        subtitle={
          hasMetadata
            ? `${Object.keys(
                metadata
              ).length} document properties detected`
            : "No document metadata detected"
        }
        metadata={
          metadata
        }
        icon={
          <Database size={18} />
        }
      />

      <MetadataTable
        title="Raw Document Metadata"
        subtitle="Complete parser output"
        metadata={
          rawMetadata
        }
        icon={
          <Database size={18} />
        }
      />
    </>
  );
}

/* =========================================================
   METADATA TABLE
========================================================= */

function MetadataTable({
  title,
  subtitle,
  metadata,
  icon,
}) {
  const entries =
    flattenMetadata(
      metadata
    );

  return (
    <section className="metadata-panel">
      <PanelHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
      />

      {entries.length > 0 ? (
        <div className="raw-metadata">
          {entries.map(
            ([key, value]) => (
              <MetadataRow
                key={key}
                label={key}
                value={formatMetadataValue(
                  value
                )}
              />
            )
          )}
        </div>
      ) : (
        <div className="empty-metadata">
          <Database size={24} />

          <strong>
            No metadata found
          </strong>

          <p>
            No readable metadata was
            found in this file.
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   GPS INTELLIGENCE
========================================================= */

function LocationIntelligence({
  metadata,
}) {
  const coordinates =
    getGPSCoordinates(metadata);

  const [address, setAddress] =
    useState(null);
  const [addressLoading, setAddressLoading] =
    useState(false);
  const [addressError, setAddressError] =
    useState("");

  if (!coordinates) {
    return (
      <section className="location-panel location-clear">
        <div className="location-header">
          <div className="location-icon">
            <MapPin size={20} />
          </div>

          <div>
            <span>
              LOCATION INTELLIGENCE
            </span>

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

  const handleAddressLookup = async () => {
    setAddressLoading(true);
    setAddressError("");

    try {
      const result = await reverseGeocode(
        coordinates.latitude,
        coordinates.longitude
      );

      setAddress(result);
    } catch (error) {
      console.error(
        "Reverse geocoding failed:",
        error
      );

      setAddressError(
        error.message ||
          "Unable to resolve an address for these coordinates."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  const clearAddress = () => {
    setAddress(null);
    setAddressError("");
  };

  return (
    <section className="location-panel location-detected">
      <div className="location-header">
        <div className="location-icon danger">
          <MapPin size={20} />
        </div>

        <div className="location-title">
          <span>
            LOCATION INTELLIGENCE
          </span>

          <h2>
            GPS Location Detected
          </h2>

          <p>
            This file contains geographic
            information that may reveal where it
            was captured.
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

      <div className="address-lookup-panel">
        <div
          className="address-lookup-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: "1 1 360px",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#737a83",
                fontSize: "8px",
                fontWeight: 800,
                letterSpacing: "0.1em",
              }}
            >
              OPTIONAL REVERSE GEOCODING
            </span>
            <strong
              style={{
                display: "block",
                color: "#c7cbd0",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              Resolve coordinates to a place
            </strong>
            <p
              style={{
                margin: "6px 0 0",
                color: "#666d76",
                fontSize: "9px",
                lineHeight: 1.55,
              }}
            >
              This lookup is manual. Your coordinates
              are sent to OpenStreetMap's Nominatim
              service only when you request the lookup.
            </p>
          </div>

          {!address && (
            <button
              type="button"
              className="address-lookup-button"
              onClick={handleAddressLookup}
              disabled={addressLoading}
            >
              <MapPin size={15} />
              {addressLoading
                ? "Resolving..."
                : "Resolve Address"}
            </button>
          )}
        </div>

        {addressError && (
          <div className="address-lookup-error">
            <AlertTriangle size={15} />
            <span>{addressError}</span>
          </div>
        )}

        {address && (
          <div
            className="address-result"
            style={{
              marginTop: "14px",
              padding: "14px",
              border: "1px solid #272d33",
              borderRadius: "10px",
              background: "#0d1013",
            }}
          >
            <div
              className="address-result-main"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                minWidth: 0,
              }}
            >
              <MapPin size={16} />

              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#737a83",
                    fontSize: "8px",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                  }}
                >
                  RESOLVED LOCATION
                </span>
                <strong
                  style={{
                    display: "block",
                    color: "#c7cbd0",
                    fontSize: "10px",
                    lineHeight: 1.55,
                    overflowWrap: "anywhere",
                  }}
                >
                  {address.displayName}
                </strong>
              </div>
            </div>

            <div
              className="address-details-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "7px",
                marginTop: "12px",
              }}
            >
              {address.city && (
                <div
                  style={{
                    minWidth: 0,
                    padding: "10px",
                    border: "1px solid #20252b",
                    borderRadius: "8px",
                    background: "#0b0d10",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "#5d646d",
                      fontSize: "7px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    CITY / LOCALITY
                  </span>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#aeb4bb",
                      fontSize: "9px",
                      lineHeight: 1.4,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {address.city}
                  </strong>
                </div>
              )}

              {address.state && (
                <div
                  style={{
                    minWidth: 0,
                    padding: "10px",
                    border: "1px solid #20252b",
                    borderRadius: "8px",
                    background: "#0b0d10",
                  }}
                >
                  <span style={{ display: "block", color: "#5d646d", fontSize: "7px", fontWeight: 800, letterSpacing: "0.08em" }}>
                    STATE / REGION
                  </span>
                  <strong style={{ display: "block", marginTop: "5px", color: "#aeb4bb", fontSize: "9px", lineHeight: 1.4, overflowWrap: "anywhere" }}>
                    {address.state}
                  </strong>
                </div>
              )}

              {address.country && (
                <div
                  style={{
                    minWidth: 0,
                    padding: "10px",
                    border: "1px solid #20252b",
                    borderRadius: "8px",
                    background: "#0b0d10",
                  }}
                >
                  <span style={{ display: "block", color: "#5d646d", fontSize: "7px", fontWeight: 800, letterSpacing: "0.08em" }}>
                    COUNTRY
                  </span>
                  <strong style={{ display: "block", marginTop: "5px", color: "#aeb4bb", fontSize: "9px", lineHeight: 1.4, overflowWrap: "anywhere" }}>
                    {address.country}
                  </strong>
                </div>
              )}

              {address.postcode && (
                <div
                  style={{
                    minWidth: 0,
                    padding: "10px",
                    border: "1px solid #20252b",
                    borderRadius: "8px",
                    background: "#0b0d10",
                  }}
                >
                  <span style={{ display: "block", color: "#5d646d", fontSize: "7px", fontWeight: 800, letterSpacing: "0.08em" }}>
                    POSTCODE
                  </span>
                  <strong style={{ display: "block", marginTop: "5px", color: "#aeb4bb", fontSize: "9px", lineHeight: 1.4, overflowWrap: "anywhere" }}>
                    {address.postcode}
                  </strong>
                </div>
              )}
            </div>

            <div
              className="address-result-actions"
              style={{
                marginTop: "12px",
                paddingTop: "10px",
                borderTop: "1px solid #1d2227",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "#626971",
                  fontSize: "8px",
                  lineHeight: 1.4,
                }}
              >
                External lookup completed on demand.
              </span>

              <button
                type="button"
                className="location-clear"
                style={{
                  flexShrink: 0,
                }}
                onClick={clearAddress}
              >
                Clear Result
              </button>
            </div>
          </div>
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
                  {formatDirection(direction)}
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
                  {formatGPSDate(gpsDate)}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="location-disclaimer">
        <span>ⓘ</span>

        <p>
          Coordinates are extracted locally in your
          browser. Reverse geocoding is never automatic;
          it only occurs after you press Resolve Address,
          and the coordinates are then sent to the
          external geocoding provider.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   PRIVACY
========================================================= */

function normalizeMetadataKey(key = "") {
  return String(key)
    .replace(/^XMP:/i, "")
    .replace(/[_\-\s]/g, "")
    .toLowerCase();
}

function hasMetadataValue(
  metadata = {},
  keys = []
) {
  const entries = Object.entries(metadata || {});

  return keys.some((wantedKey) => {
    const normalizedWanted =
      normalizeMetadataKey(wantedKey);

    return entries.some(([key, value]) => {
      return (
        normalizeMetadataKey(key) ===
          normalizedWanted &&
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      );
    });
  });
}

function calculatePrivacyScore(
  findings = []
) {
  const detected = findings.filter(
    (finding) => finding.detected
  );

  const score = Math.min(
    detected.reduce(
      (total, finding) =>
        total + (finding.points || 0),
      0
    ),
    100
  );

  const level =
    score >= 90
      ? "CRITICAL"
      : score >= 70
      ? "HIGH"
      : score >= 40
      ? "MEDIUM"
      : score >= 20
      ? "LOW"
      : "MINIMAL";

  const descriptions = {
    CRITICAL:
      "Multiple high-value privacy indicators are exposed. Remove sensitive metadata before public distribution.",
    HIGH:
      "The file exposes significant privacy-sensitive metadata that could help identify a person, device, place, or timeline.",
    MEDIUM:
      "The file contains several metadata signals that may disclose useful contextual or identifying information.",
    LOW:
      "A limited amount of privacy-relevant metadata was detected.",
    MINIMAL:
      "No significant privacy-sensitive metadata was detected by the current ruleset.",
  };

  return {
    score,
    level,
    description: descriptions[level],
    detectedCount: detected.length,
    points: detected.reduce(
      (total, finding) =>
        total + (finding.points || 0),
      0
    ),
    recommendations: detected.map(
      (finding) => finding.recommendation
    ),
  };
}

function getPrivacyFindings(
  metadata = {}
) {
  const coordinates =
    getGPSCoordinates(metadata);

  const hasGPS = Boolean(coordinates);

  const hasGPSContext =
    hasMetadataValue(metadata, [
      "GPSAltitude",
      "Altitude",
      "GPSImgDirection",
      "GPSDirection",
      "GPSDateStamp",
      "GPSDateTime",
    ]);

  const hasCamera =
    hasMetadataValue(metadata, [
      "Make",
      "Model",
      "CameraMake",
      "CameraModel",
      "LensModel",
      "LensMake",
    ]);

  const hasDeviceIdentifier =
    hasMetadataValue(metadata, [
      "SerialNumber",
      "BodySerialNumber",
      "CameraSerialNumber",
      "LensSerialNumber",
      "OwnerName",
      "DeviceSerialNumber",
      "HostComputer",
    ]);

  const hasTimestamp =
    hasMetadataValue(metadata, [
      "DateTimeOriginal",
      "CreateDate",
      "ModifyDate",
      "DateTime",
      "Created",
      "Modified",
      "DateCreated",
      "GPSDateTime",
      "GPSDateStamp",
    ]);

  const hasSoftware =
    hasMetadataValue(metadata, [
      "Software",
      "CreatorTool",
      "ProcessingSoftware",
      "Application",
      "Application Version",
      "HostComputer",
    ]);

  const hasPersonalIdentity =
    hasMetadataValue(metadata, [
      "Artist",
      "Author",
      "Creator",
      "Byline",
      "BylineTitle",
      "CreatorWorkEmail",
      "CreatorWorkTelephone",
      "CreatorAddress",
      "CreatorPostalCode",
      "OwnerName",
      "LastModifiedBy",
      "Last Modified By",
    ]);

  const hasPersonalContext =
    hasMetadataValue(metadata, [
      "Copyright",
      "Keywords",
      "Subject",
      "Description",
      "ImageDescription",
      "Category",
      "Company",
      "Manager",
    ]);

  const hasDocumentIdentity =
    hasMetadataValue(metadata, [
      "Title",
      "Author",
      "Creator",
      "LastModifiedBy",
      "Last Modified By",
      "Company",
      "Manager",
    ]);

  return [
    {
      title: "GPS Location",
      description: hasGPS
        ? `Precise geographic coordinates were detected (${formatDecimalCoordinates(
            coordinates.latitude,
            coordinates.longitude
          )}). This can reveal the physical location associated with the file.`
        : "No usable GPS coordinates were detected.",
      detected: hasGPS,
      severity: "Critical Risk",
      points: hasGPS ? 45 : 0,
      recommendation:
        "Remove GPS/location metadata before publishing or sending the file to people who do not need its location.",
    },
    {
      title: "Device Identity",
      description: hasDeviceIdentifier
        ? "Device or hardware-identifying metadata was detected, including a serial, owner, or host identifier."
        : hasCamera
        ? "Camera manufacturer, model, or lens information was detected."
        : "No camera or device identity metadata was detected.",
      detected:
        hasDeviceIdentifier || hasCamera,
      severity: hasDeviceIdentifier
        ? "High Risk"
        : "Medium Risk",
      points: hasDeviceIdentifier
        ? 20
        : hasCamera
        ? 12
        : 0,
      recommendation:
        hasDeviceIdentifier
          ? "Remove serial numbers, owner names, and host/device identifiers before sharing the file publicly."
          : "Consider removing camera and lens make/model information when device fingerprinting is unnecessary.",
    },
    {
      title: "Personal Identity",
      description: hasPersonalIdentity
        ? "Author, creator, owner, contact, or last-editor information was detected."
        : hasPersonalContext || hasDocumentIdentity
        ? "Descriptive or document identity fields were detected and may provide personal or organizational context."
        : "No obvious author or personal identity fields were detected.",
      detected:
        hasPersonalIdentity ||
        hasPersonalContext ||
        hasDocumentIdentity,
      severity: hasPersonalIdentity
        ? "High Risk"
        : "Medium Risk",
      points: hasPersonalIdentity
        ? 20
        : hasPersonalContext || hasDocumentIdentity
        ? 10
        : 0,
      recommendation:
        hasPersonalIdentity
          ? "Remove author, creator, owner, contact, and last-editor fields unless attribution is intentionally required."
          : "Review descriptive, copyright, keyword, and document identity fields before public sharing.",
    },
    {
      title: "Timeline",
      description: hasTimestamp
        ? "Capture, creation, modification, or GPS timestamp information was detected and can expose activity timing."
        : "No privacy-relevant timestamps were detected.",
      detected: hasTimestamp,
      severity: "Low Risk",
      points: hasTimestamp ? 10 : 0,
      recommendation:
        "Remove capture and modification timestamps when the timing of the file's creation or activity is sensitive.",
    },
    {
      title: "Software & Processing",
      description: hasSoftware
        ? "Software, application, processing, or host-computer traces were detected."
        : "No software or processing traces were detected.",
      detected: hasSoftware,
      severity: "Low Risk",
      points: hasSoftware ? 5 : 0,
      recommendation:
        "Remove software and host-computer traces when they reveal unnecessary information about your workflow or environment.",
    },
    {
      title: "GPS Context",
      description: hasGPSContext
        ? "Additional GPS context such as altitude, direction, or GPS timestamps was detected."
        : "No additional GPS context was detected.",
      detected: hasGPSContext,
      severity: "Medium Risk",
      points: 0,
      recommendation:
        "If location metadata is sensitive, remove the complete GPS metadata block rather than only the latitude and longitude fields.",
    },
  ];
}

function PrivacyScoreCard({ assessment }) {
  const score = assessment?.score || 0;
  const level = assessment?.level || "MINIMAL";

  const scoreColor =
    score >= 90
      ? "#c96f62"
      : score >= 70
      ? "#d48a61"
      : score >= 40
      ? "#c5a15d"
      : score >= 20
      ? "#8d9b6f"
      : "#70a989";

  const detectedFactors =
    (assessment?.recommendations || []).length;

  return (
    <div
      style={{
        margin: "0 0 14px",
        padding: "18px",
        border: "1px solid #24282e",
        borderRadius: "12px",
        background: "#0b0d10",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "86px",
            height: "86px",
            borderRadius: "50%",
            background: `conic-gradient(${scoreColor} ${score}%, #20252a ${score}% 100%)`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "#0b0d10",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            <div>
              <strong
                style={{
                  display: "block",
                  color: "#d5d8dc",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                {score}
              </strong>
              <span
                style={{
                  color: "#626970",
                  fontSize: "7px",
                  letterSpacing: "0.08em",
                }}
              >
                / 100
              </span>
            </div>
          </div>
        </div>

        <div style={{ minWidth: "180px", flex: 1 }}>
          <span
            style={{
              display: "block",
              color: "#656b73",
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "0.12em",
            }}
          >
            PRIVACY RISK SCORE
          </span>

          <strong
            style={{
              display: "block",
              marginTop: "5px",
              color: scoreColor,
              fontSize: "13px",
              letterSpacing: "0.04em",
            }}
          >
            {level} RISK
          </strong>

          <p
            style={{
              margin: "6px 0 0",
              color: "#686f77",
              fontSize: "9px",
              lineHeight: 1.5,
            }}
          >
            {assessment?.description}
          </p>

          <span
            style={{
              display: "block",
              marginTop: "7px",
              color: "#555c64",
              fontSize: "8px",
            }}
          >
            {detectedFactors} actionable factor
            {detectedFactors === 1 ? "" : "s"} detected
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid #1d2126",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#656b73",
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "0.12em",
          }}
        >
          SCORING MODEL
        </span>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(145px, 1fr))",
            gap: "6px",
          }}
        >
          {[
            ["GPS Location", 45],
            ["Device Identity", 20],
            ["Personal Identity", 20],
            ["Timeline", 10],
            ["Software & Processing", 5],
          ].map(([label, points]) => {
            const finding = (assessment?.findings || []).find(
              (item) => item.title === label
            );

            const active = Boolean(finding?.detected);

            return (
              <div
                key={label}
                style={{
                  padding: "9px",
                  border: `1px solid ${
                    active ? "#383128" : "#20252b"
                  }`,
                  borderRadius: "8px",
                  background: active
                    ? "#110f0d"
                    : "#0d1013",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#5d646d",
                    fontSize: "7px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  {label}
                </span>
                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: active ? scoreColor : "#4e555d",
                    fontFamily: "monospace",
                    fontSize: "10px",
                  }}
                >
                  {active ? `+${finding.points}` : "0"} / {points}
                </strong>
              </div>
            );
          })}
        </div>
      </div>

      {assessment?.recommendations?.length > 0 && (
        <div
          style={{
            marginTop: "14px",
            paddingTop: "14px",
            borderTop: "1px solid #1d2126",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#656b73",
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "0.12em",
            }}
          >
            RECOMMENDED ACTIONS
          </span>

          <div
            style={{
              display: "grid",
              gap: "5px",
            }}
          >
            {assessment.recommendations.map(
              (recommendation, index) => (
                <div
                  key={`${recommendation}-${index}`}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    padding: "8px 9px",
                    border: "1px solid #20252b",
                    borderRadius: "7px",
                    background: "#0d1013",
                  }}
                >
                  <ShieldCheck
                    size={13}
                    style={{
                      flexShrink: 0,
                      marginTop: "1px",
                      color: "#747b84",
                    }}
                  />
                  <span
                    style={{
                      color: "#8a9199",
                      fontSize: "8px",
                      lineHeight: 1.5,
                    }}
                  >
                    {recommendation}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REPORT CREATION
========================================================= */

function createReport(
  result
) {
  const metadata =
    result?.metadata || {};

  const rawMetadata =
    result?.rawMetadata || {};

  const coordinates =
    getGPSCoordinates(
      metadata
    );

  return {
    report: {
      product:
        "MetaScan",

      version:
        "1.0.0",

      generatedAt:
        new Date().toISOString(),

      processingMode:
        "Client-side / Local Browser",
    },

    file: {
      name:
        result.file.name,

      size:
        result.file.size,

      formattedSize:
        formatFileSize(
          result.file.size
        ),

      mimeType:
        result.file.type,

      extension:
        result.file.extension,

      category:
        result.file.category,

      lastModified:
        result.file
          .lastModifiedDate instanceof
        Date
          ? result.file.lastModifiedDate.toISOString()
          : result.file
              .lastModifiedDate,
    },

    cryptographicFingerprint: {
      algorithm:
        result.hash.algorithm,

      value:
        result.hash.value,
    },

    document:
      result.document ||
      null,

    image:
      result.image ||
      null,

    location: coordinates
      ? {
          detected:
            true,

          latitude:
            coordinates.latitude,

          longitude:
            coordinates.longitude,

          mapURL:
            createMapURL(
              coordinates.latitude,
              coordinates.longitude
            ),

          altitude:
            metadata.GPSAltitude ??
            metadata.Altitude ??
            null,

          direction:
            metadata.GPSImgDirection ??
            metadata.GPSDirection ??
            null,

          gpsTimestamp:
            metadata.GPSDateStamp ??
            metadata.GPSDateTime ??
            null,
        }
      : {
          detected:
            false,
        },

    privacyAnalysis: (() => {
      const findings =
        getPrivacyFindings(metadata);

      return {
        ...calculatePrivacyScore(findings),
        findings,
      };
    })(),

    metadata,

    rawMetadata,

    privacyStatement:
      "The analyzed file was processed locally in the browser and was not uploaded to a MetaScan server.",
  };
}

/* =========================================================
   PDF REPORT
========================================================= */

async function createPDFReport(
  report,
  filename
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 16;
  const footerHeight = 12;
  const contentWidth = pageWidth - margin * 2;
  const contentBottom = pageHeight - footerHeight;
  let y = 20;

  const colors = {
    ink: [28, 32, 38],
    muted: [98, 106, 116],
    subtle: [145, 151, 159],
    line: [218, 222, 227],
    panel: [245, 247, 249],
    panelDark: [235, 239, 243],
    danger: [157, 57, 47],
    warning: [145, 103, 42],
    success: [55, 105, 72],
  };

  const drawFooter = (pageNumber) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.muted);
    pdf.text(
      "MetaScan — Metadata & Privacy Analyzer",
      margin,
      pageHeight - 7
    );
    pdf.text(
      `Page ${pageNumber}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: "right" }
    );
  };

  const newPage = () => {
    pdf.addPage();
    y = 20;
  };

  const ensureSpace = (height = 10) => {
    if (y + height > contentBottom) {
      newPage();
    }
  };

  const addSection = (title) => {
    // Keep the section heading with enough room for at least one row.
    ensureSpace(22);

    pdf.setFillColor(...colors.panel);
    pdf.roundedRect(
      margin,
      y - 5,
      contentWidth,
      9,
      2,
      2,
      "F"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.ink);
    pdf.text(title, margin + 4, y + 1);

    y += 12;
  };

  const addKeyValue = (
    key,
    value,
    sensitive = false
  ) => {
    const text = formatMetadataValue(value);
    const valueText =
      text === null || text === undefined || text === ""
        ? "Not available"
        : String(text);

    const keyLines = pdf.splitTextToSize(
      String(key),
      43
    );

    const valueLines = pdf.splitTextToSize(
      valueText,
      contentWidth - 52
    );

    const lineHeight = 3.8;
    const rowHeight = Math.max(
      9,
      Math.max(keyLines.length, valueLines.length) *
        lineHeight +
        5
    );

    ensureSpace(rowHeight + 1);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...colors.muted);
    pdf.text(
      keyLines,
      margin + 2,
      y + 4
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(
      ...(sensitive ? colors.danger : colors.ink)
    );
    pdf.text(
      valueLines,
      margin + 50,
      y + 4
    );

    pdf.setDrawColor(...colors.line);
    pdf.line(
      margin,
      y + rowHeight,
      pageWidth - margin,
      y + rowHeight
    );

    y += rowHeight + 1;
  };

  const getSeverityColor = (severity = "") => {
    const normalized = String(severity).toLowerCase();

    if (normalized.includes("critical") || normalized.includes("high")) {
      return colors.danger;
    }

    if (normalized.includes("medium") || normalized.includes("moderate")) {
      return colors.warning;
    }

    return colors.muted;
  };

  const addFinding = (finding) => {
    const title =
      `${finding.title || "Privacy Finding"} — ${
        finding.severity || "Risk"
      }`;

    const description =
      finding.description ||
      "Information was detected in the file metadata.";

    const recommendation =
      finding.recommendation ||
      "Review and remove unnecessary metadata before sharing the file.";

    const descriptionLines = pdf.splitTextToSize(
      description,
      contentWidth - 8
    );

    const recommendationLines = pdf.splitTextToSize(
      `Recommendation: ${recommendation}`,
      contentWidth - 8
    );

    const lineHeight = 3.7;
    const cardHeight =
      10 +
      descriptionLines.length * lineHeight +
      recommendationLines.length * lineHeight +
      9;

    ensureSpace(cardHeight + 3);

    pdf.setFillColor(250, 250, 251);
    pdf.setDrawColor(...colors.line);
    pdf.roundedRect(
      margin,
      y - 4,
      contentWidth,
      cardHeight,
      2,
      2,
      "FD"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...colors.ink);
    pdf.text(title, margin + 4, y + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(
      ...getSeverityColor(finding.severity)
    );
    pdf.text(
      `${finding.detected ? "Detected" : "Not detected"}${
        finding.points !== undefined
          ? ` • ${finding.points} points`
          : ""
      }`,
      pageWidth - margin - 4,
      y + 2,
      { align: "right" }
    );

    let textY = y + 7;

    pdf.setTextColor(...colors.ink);
    pdf.text(
      descriptionLines,
      margin + 4,
      textY
    );
    textY += descriptionLines.length * lineHeight + 2;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...colors.muted);
    pdf.text(
      recommendationLines,
      margin + 4,
      textY
    );

    y += cardHeight + 4;
  };

  // Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...colors.ink);
  pdf.text("MetaScan", margin, y);

  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.muted);
  pdf.text(
    "Metadata & Privacy Analysis Report",
    margin,
    y
  );

  y += 5;
  pdf.setFontSize(7);
  pdf.setTextColor(...colors.subtle);
  pdf.text(
    `Generated ${formatReportDate(report.report?.generatedAt)}`,
    margin,
    y + 4
  );

  y += 12;
  pdf.setDrawColor(...colors.line);
  pdf.line(
    margin,
    y,
    pageWidth - margin,
    y
  );
  y += 10;

  // Privacy score
  addSection("Privacy Risk Assessment");

  const score =
    Number(report.privacyAnalysis?.score) || 0;
  const level =
    report.privacyAnalysis?.level || "Minimal";

  ensureSpace(28);

  pdf.setFillColor(...colors.panel);
  pdf.roundedRect(
    margin,
    y - 5,
    contentWidth,
    23,
    3,
    3,
    "F"
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(...colors.ink);
  pdf.text(`${score}/100`, margin + 5, y + 9);

  pdf.setFontSize(9);
  pdf.text(
    `Risk Level: ${String(level).toUpperCase()}`,
    margin + 48,
    y + 4
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text(
    "Higher scores indicate greater privacy exposure in the extracted metadata.",
    margin + 48,
    y + 10
  );

  const barX = margin + 48;
  const barY = y + 15;
  const barWidth = contentWidth - 53;

  pdf.setFillColor(...colors.panelDark);
  pdf.roundedRect(
    barX,
    barY,
    barWidth,
    3,
    1.5,
    1.5,
    "F"
  );

  if (score > 0) {
    pdf.setFillColor(...getSeverityColor(level));
    pdf.roundedRect(
      barX,
      barY,
      Math.max(2, (barWidth * score) / 100),
      3,
      1.5,
      1.5,
      "F"
    );
  }

  y += 30;

  const factors =
    report.privacyAnalysis?.factors || [];

  if (factors.length) {
    factors.forEach((factor) => {
      addKeyValue(
        factor.name || factor.title || "Factor",
        `${factor.detected ? "Detected" : "Not detected"} — ${
          factor.points || 0
        } points`,
        false
      );
    });
  }

  // Findings
  addSection("Privacy Findings");

  const findings =
    report.privacyAnalysis?.findings || [];

  const detectedFindings = findings.filter(
    (finding) => finding.detected
  );

  if (!detectedFindings.length) {
    addKeyValue(
      "Status",
      "No privacy-sensitive metadata findings were detected."
    );
  } else {
    detectedFindings.forEach(addFinding);
  }

  // File information
  addSection("File Information");
  addKeyValue("File Name", report.file.name);
  addKeyValue("File Size", report.file.formattedSize);
  addKeyValue("MIME Type", report.file.mimeType);
  addKeyValue("Extension", report.file.extension);
  addKeyValue("Category", report.file.category);
  addKeyValue("Last Modified", report.file.lastModified);

  // Cryptographic fingerprint
  addSection("Cryptographic Fingerprint");
  addKeyValue(
    report.cryptographicFingerprint.algorithm,
    report.cryptographicFingerprint.value
  );

  // Document information
  if (report.document) {
    addSection("Document Information");
    Object.entries(report.document).forEach(
      ([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          typeof value !== "object"
        ) {
          addKeyValue(key, value);
        }
      }
    );
  }

  // Image information
  if (report.image?.dimensions) {
    addSection("Image Information");
    Object.entries(report.image.dimensions).forEach(
      ([key, value]) => addKeyValue(key, value)
    );
  }

  // Location intelligence
  addSection("Location Intelligence");

  if (report.location?.detected) {
    addKeyValue(
      "Latitude",
      report.location.latitude,
      true
    );
    addKeyValue(
      "Longitude",
      report.location.longitude,
      true
    );
    addKeyValue(
      "Altitude",
      report.location.altitude
    );
    addKeyValue(
      "Direction",
      report.location.direction
    );
    addKeyValue(
      "GPS Timestamp",
      report.location.gpsTimestamp,
      true
    );
    addKeyValue(
      "Map",
      report.location.mapURL || "Available in the application"
    );
  } else {
    addKeyValue(
      "GPS",
      "No valid GPS coordinates detected."
    );
  }

  // Extracted metadata
  addSection("Extracted Metadata");

  const flattened = flattenMetadata(
    report.metadata || {}
  );

  if (!flattened.length) {
    addKeyValue(
      "Metadata",
      "No metadata fields detected."
    );
  } else {
    flattened.forEach(([key, value]) =>
      addKeyValue(key, value)
    );
  }

  // Privacy statement
  addSection("Privacy Statement");

  const statement =
    report.privacyStatement ||
    "Processed locally in the browser.";

  const statementLines = pdf.splitTextToSize(
    statement,
    contentWidth - 8
  );

  ensureSpace(statementLines.length * 4 + 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.muted);
  pdf.text(
    statementLines,
    margin + 4,
    y + 2
  );

  y += statementLines.length * 4 + 8;

  // Draw the correct page number on every page.
  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    drawFooter(page);
  }

  pdf.save(filename);
}

function formatReportDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

/* =========================================================
   HTML REPORT
========================================================= */

function createHTMLReport(
  report
) {
  const file =
    report.file;

  const metadata =
    report.metadata ||
    {};

  const privacyAnalysis =
    report.privacyAnalysis ||
    {};

  const findings =
    privacyAnalysis.findings ||
    [];

  const location =
    report.location;

  const metadataRows =
    flattenMetadata(
      metadata
    )
      .map(
        ([key, value]) => `
          <tr>
            <td>${escapeHTML(
              key
            )}</td>

            <td>${escapeHTML(
              formatMetadataValue(
                value
              )
            )}</td>
          </tr>
        `
      )
      .join("");

  const findingRows =
    findings
      .map(
        (finding) => `
          <tr>
            <td>${escapeHTML(
              finding.title
            )}</td>

            <td class="${
              finding.detected
                ? "detected"
                : "clear"
            }">
              ${
                finding.detected
                  ? escapeHTML(
                      finding.severity
                    )
                  : "CLEAR"
              }
            </td>

            <td>
              ${
                finding.detected
                  ? escapeHTML(
                      finding.description
                    )
                  : "No information detected"
              }
            </td>
          </tr>
        `
      )
      .join("");

  const locationSection =
    location?.detected
      ? `
        <div class="section">

          <h2>
            Location Intelligence
          </h2>

          <table>

            <tr>
              <td>Latitude</td>

              <td>
                ${escapeHTML(
                  String(
                    location.latitude
                  )
                )}
              </td>
            </tr>

            <tr>
              <td>Longitude</td>

              <td>
                ${escapeHTML(
                  String(
                    location.longitude
                  )
                )}
              </td>
            </tr>

            ${
              location.altitude !==
                null &&
              location.altitude !==
                undefined
                ? `
              <tr>
                <td>Altitude</td>
                <td>${escapeHTML(
                  String(
                    location.altitude
                  )
                )}</td>
              </tr>
              `
                : ""
            }

            ${
              location.direction !==
                null &&
              location.direction !==
                undefined
                ? `
              <tr>
                <td>Direction</td>
                <td>${escapeHTML(
                  String(
                    location.direction
                  )
                )}</td>
              </tr>
              `
                : ""
            }

          </table>

          ${
            location.mapURL
              ? `
                <p>
                  <a
                    href="${escapeHTML(
                      location.mapURL
                    )}"
                    target="_blank"
                  >
                    Open location on map
                  </a>
                </p>
              `
              : ""
          }

        </div>
      `
      : `
        <div class="section">

          <h2>
            Location Intelligence
          </h2>

          <p>
            No GPS coordinates were detected.
          </p>

        </div>
      `;

  return `<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
MetaScan Report -
${escapeHTML(
  file.name
)}
</title>

<style>

body {
  margin: 0;
  padding: 40px;
  background: #08090b;
  color: #e8e9eb;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  border-bottom:
    1px solid #2a2d32;

  padding-bottom:
    25px;

  margin-bottom:
    30px;
}

.brand {
  font-size:
    26px;

  font-weight:
    800;
}

.subtitle {
  color:
    #7e848d;

  margin-top:
    6px;
}

.section {
  border:
    1px solid #24282e;

  background:
    #0d0f12;

  border-radius:
    12px;

  padding:
    22px;

  margin-bottom:
    18px;
}

h2 {
  margin-top:
    0;

  font-size:
    18px;
}

table {
  width:
    100%;

  border-collapse:
    collapse;
}

td,
th {
  padding:
    11px;

  text-align:
    left;

  border-bottom:
    1px solid #1e2126;

  vertical-align:
    top;
}

th {
  color:
    #9da2aa;
}

td {
  color:
    #d2d5d9;

  word-break:
    break-word;
}

.detected {
  color:
    #d89967;

  font-weight:
    bold;
}

.clear {
  color:
    #75b68d;

  font-weight:
    bold;
}

.hash {
  background:
    #08090b;

  padding:
    15px;

  border-radius:
    8px;

  word-break:
    break-all;

  font-family:
    monospace;

  color:
    #bfc5cc;
}

a {
  color:
    #c8ccd1;
}

.footer {
  margin-top:
    30px;

  color:
    #626871;

  font-size:
    12px;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<div class="brand">
MetaScan
</div>

<div class="subtitle">
Metadata & Privacy Analyzer —
Forensic Analysis Report
</div>

</div>

<div class="section">

<h2>
File Information
</h2>

<table>

<tr>
<th>Property</th>
<th>Value</th>
</tr>

<tr>
<td>File Name</td>
<td>
${escapeHTML(
  file.name
)}
</td>
</tr>

<tr>
<td>File Size</td>
<td>
${escapeHTML(
  file.formattedSize
)}
</td>
</tr>

<tr>
<td>MIME Type</td>
<td>
${escapeHTML(
  file.mimeType
)}
</td>
</tr>

<tr>
<td>Extension</td>
<td>
${escapeHTML(
  file.extension ||
    "—"
)}
</td>
</tr>

<tr>
<td>Category</td>
<td>
${escapeHTML(
  file.category
)}
</td>
</tr>

<tr>
<td>Last Modified</td>
<td>
${escapeHTML(
  file.lastModified ||
    "Unknown"
)}
</td>
</tr>

</table>

</div>

<div class="section">

<h2>
Cryptographic Fingerprint
</h2>

<p>
<strong>
${escapeHTML(
  report
    .cryptographicFingerprint
    .algorithm
)}
</strong>
</p>

<div class="hash">

${escapeHTML(
  report
    .cryptographicFingerprint
    .value
)}

</div>

</div>

${locationSection}

<div class="section">

<h2>
Privacy Analysis
</h2>

<p>
<strong>Risk Score:</strong>
${escapeHTML(String(privacyAnalysis.score ?? 0))}/100
&nbsp; — &nbsp;
<strong>Level:</strong>
${escapeHTML(privacyAnalysis.level || "MINIMAL")}
</p>

<p>
${escapeHTML(privacyAnalysis.description || "No privacy assessment available.")}
</p>

<table>

<tr>
<th>Finding</th>
<th>Status</th>
<th>Details</th>
</tr>

${findingRows}

</table>

</div>

<div class="section">

<h2>
Extracted Metadata
</h2>

${
  metadataRows
    ? `
      <table>

      <tr>
      <th>Field</th>
      <th>Value</th>
      </tr>

      ${metadataRows}

      </table>
    `
    : `
      <p>
        No readable metadata was detected.
      </p>
    `
}

</div>

<div class="footer">

Generated by MetaScan on

${escapeHTML(
  report.report.generatedAt
)}.

<br>
<br>

${escapeHTML(
  report.privacyStatement
)}

</div>

</div>

</body>

</html>`;
}

/* =========================================================
   HELPER COMPONENTS
========================================================= */

function PanelHeader({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="panel-header">
      <div className="panel-title-icon">
        {icon}
      </div>

      <div>
        <h3>
          {title}
        </h3>

        <p>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function MetadataRow({
  label,
  value,
}) {
  return (
    <div className="metadata-row">
      <span>
        {label}
      </span>

      <strong
        title={String(
          value
        )}
      >
        {String(value)}
      </strong>
    </div>
  );
}

function PrivacyFinding({
  title,
  description,
  detected,
  severity,
}) {
  return (
    <div
      className={`privacy-finding ${
        detected
          ? "detected"
          : "clear"
      }`}
    >
      <div className="finding-status">
        {detected ? (
          <AlertTriangle
            size={16}
          />
        ) : (
          <CheckCircle2
            size={16}
          />
        )}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {detected
            ? description
            : "No information detected"}
        </p>
      </div>

      <span className="finding-label">
        {detected
          ? severity.toUpperCase()
          : "CLEAR"}
      </span>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-icon">
        {icon}
      </div>

      <div>
        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function flattenMetadata(
  object,
  prefix = ""
) {
  if (
    !object ||
    typeof object !==
      "object"
  ) {
    return [];
  }

  const result = [];

  Object.entries(
    object
  ).forEach(
    ([key, value]) => {
      const fullKey =
        prefix
          ? `${prefix}.${key}`
          : key;

      if (
        value &&
        typeof value ===
          "object" &&
        !Array.isArray(
          value
        ) &&
        !(value instanceof Date)
      ) {
        result.push(
          ...flattenMetadata(
            value,
            fullKey
          )
        );
      } else {
        result.push([
          fullKey,
          value,
        ]);
      }
    }
  );

  return result;
}

function formatMetadataValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "Not available";
  }

  if (
    value instanceof Date
  ) {
    return formatDate(
      value
    );
  }

  if (
    Array.isArray(value)
  ) {
    return value.join(
      ", "
    );
  }

  if (
    typeof value ===
    "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return String(
        value
      );
    }
  }

  return String(value);
}

function formatDate(
  date
) {
  if (!date) {
    return "Not available";
  }

  const parsedDate =
    date instanceof Date
      ? date
      : new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(
      date
    );
  }

  return parsedDate.toLocaleString();
}

function formatAltitude(
  value
) {
  if (
    typeof value ===
    "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return String(
      value
    );
  }

  return `${number.toFixed(
    2
  )} m`;
}

function formatDirection(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return String(
      value
    );
  }

  return `${number.toFixed(
    2
  )}°`;
}

function formatGPSDate(
  value
) {
  if (
    Array.isArray(value)
  ) {
    return value.join(
      ":"
    );
  }

  return String(
    value
  );
}

function formatFileSize(
  bytes
) {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

  return `${parseFloat(
    (
      bytes /
      Math.pow(
        1024,
        index
      )
    ).toFixed(2)
  )} ${
    units[index]
  }`;
}

function removeExtension(
  filename
) {
  return filename.replace(
    /\.[^/.]+$/,
    ""
  );
}

function escapeHTML(
  value
) {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function downloadBlob(
  blob,
  filename
) {
  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;
  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(
    url
  );
}

export default App;