import React, { useState, useEffect } from "react";
import { Col } from "react-bootstrap";

const UploadDetails = ({
  uploadProgress,
  uploadSpeed,
  averageSpeed,
  selectedFile,
  error,
  downloadLink,
  uploadDuration,
  verificationDuration,
}) => {
  const [fileSize, setFileSize] = useState(0);

  useEffect(() => {
    if (!error && selectedFile) {
      setFileSize(selectedFile.size);
    }
  }, [selectedFile, error]);

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  return (
    <Col md={{ span: 6, offset: 3 }} className="mb-3 mt-3">
      {uploadProgress > 0 && <p>Progress: {uploadProgress}%</p>}
      {uploadSpeed && <p>Current Upload Speed: {uploadSpeed} MB/s</p>}
      {averageSpeed && <p>Average Upload Speed: {averageSpeed} MB/s</p>}
      <p>File Size: {formatFileSize(fileSize)}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {downloadLink && (
        <div>
          <p>
            Upload completed.{" "}
            <a
              href={downloadLink}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              Download file
            </a>
          </p>
          {uploadDuration && <p>Upload duration: {uploadDuration}</p>}
          {verificationDuration && (
            <p>Verification duration: {verificationDuration}</p>
          )}
        </div>
      )}
    </Col>
  );
};

export default UploadDetails;
