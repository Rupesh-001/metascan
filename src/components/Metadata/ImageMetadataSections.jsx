import MetadataGrid from "./MetadataGrid";
import RawMetadataSection from "./RawMetadataSection";

import {
  getCameraMetadata,
  getExposureMetadata,
  getDateMetadata,
  getSoftwareMetadata,
  getPersonalMetadata,
  getLocationMetadata,
  getXMPMetadata,
  getOtherMetadata,
} from "../../utils/metadataHelpers";

export default function ImageMetadataSections({
  metadata = {},
}) {
  const camera =
    getCameraMetadata(metadata);

  const exposure =
    getExposureMetadata(metadata);

  const dates =
    getDateMetadata(metadata);

  const location =
    getLocationMetadata(metadata);

  const software =
    getSoftwareMetadata(metadata);

  const personal =
    getPersonalMetadata(metadata);

  const xmp =
    getXMPMetadata(metadata);

  const other =
    getOtherMetadata(metadata);

  return (
    <div className="metadata-sections">
      <MetadataGrid
        title="Camera & Lens"
        description="Camera body, lens, serial and firmware information."
        type="camera"
        items={camera}
      />

      <MetadataGrid
        title="Exposure"
        description="Photographic settings captured when the image was created."
        type="exposure"
        items={exposure}
      />

      <MetadataGrid
        title="Dates & Timestamps"
        description="Capture, modification and embedded GPS timestamps."
        type="dates"
        items={dates}
      />

      <MetadataGrid
        title="Location"
        description="Geographic information embedded in the image metadata."
        type="location"
        items={location}
      />

      <MetadataGrid
        title="Software & Device"
        description="Software, firmware and processing traces."
        type="software"
        items={software}
      />

      <MetadataGrid
        title="Creator & Personal Information"
        description="Metadata that may identify the creator or provide personal context."
        type="personal"
        items={personal}
      />

      <MetadataGrid
        title="XMP Metadata"
        description="Extensible Metadata Platform properties embedded in the file."
        type="xmp"
        items={xmp}
      />

      <MetadataGrid
        title="Other Metadata"
        description="Additional extracted metadata fields."
        type="raw"
        items={other}
      />

      <RawMetadataSection
        metadata={metadata}
      />
    </div>
  );
}