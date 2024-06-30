import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Button,
  ProgressBar,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import UploadDetails from "./UploadDetails";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState("");
  const [uploadStart, setUploadStart] = useState(null);
  const [uploadEnd, setUploadEnd] = useState(null);
  const [verificationStart, setVerificationStart] = useState(null);
  const [verificationEnd, setVerificationEnd] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [error, setError] = useState(null);
  const lastLoadedRef = useRef(0);
  const lastTimeRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFileType(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setError("Please select a valid video file (MP4, MPEG).");
    }
  };

  const validateFileType = (file) => {
    const allowedTypes = ["video/mp4", "video/mpeg", "video"];
    return allowedTypes.includes(file.type);
  };

  const handleUpload = () => {
    handleReset();

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    setUploadStart(new Date());
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = (
            (progressEvent.loaded / progressEvent.total) *
            100
          ).toFixed(2);
          setUploadProgress(progress);

          // Calculate upload speed
          const currentTime = new Date().getTime();
          if (lastTimeRef.current && lastLoadedRef.current) {
            const timeElapsed = (currentTime - lastTimeRef.current) / 1000; // SECONDS
            const dataLoaded = progressEvent.loaded - lastLoadedRef.current; // Data loaded in bytes
            const speed = (dataLoaded / timeElapsed / 1024 / 1024).toFixed(2); // DISPLAY SPEED in Megabits
            setUploadSpeed(speed);

            setTotalBytes((prev) => prev + dataLoaded);
            setTotalTime((prev) => prev + timeElapsed);
          }
          lastLoadedRef.current = progressEvent.loaded;
          lastTimeRef.current = currentTime;
        },
      })
      .then((response) => {

        console.log("Upload success:", response.data);
        setUploadProgress(parseFloat(100).toFixed(2));

        const downloadLink = response.data.result.download_link;
        setDownloadLink(downloadLink);
        setUploadEnd(new Date());

        setVerificationEnd(new Date());
        setError(null);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setError(error.response.data.message.file[0]);
          setError("An error occurred during upload.");
        }
      });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setDownloadLink("");
    setUploadStart(null);
    setUploadEnd(null);
    setVerificationStart(null);
    setVerificationEnd(null);
    setUploadSpeed(null);
    setTotalBytes(0);
    setTotalTime(0);
    setError(null);
    lastLoadedRef.current = 0;
    lastTimeRef.current = null;
  };

  const uploadDuration =
    uploadStart && uploadEnd ? (uploadEnd - uploadStart) / 1000 : null;
  const uploadMinutes = Math.floor(uploadDuration / 60);
  const uploadSeconds = Math.floor(uploadDuration % 60);

  const formattedUploadDuration = `${uploadMinutes} minute${
    uploadMinutes !== 1 ? "s" : ""
  } and ${uploadSeconds} second${uploadSeconds !== 1 ? "s" : ""}`;

  const verificationDuration =
    verificationStart && verificationEnd
      ? (verificationEnd - verificationStart) / 1000
      : null;
  const verificationMinutes = Math.floor(verificationDuration / 60);
  const verificationSeconds = Math.floor(verificationDuration % 60);

  const formattedVerificationDuration = `${verificationMinutes} minute${
    verificationMinutes !== 1 ? "s" : ""
  } and ${verificationSeconds} second${verificationSeconds !== 1 ? "s" : ""}`;

  const averageSpeed =
    totalBytes && totalTime
      ? (totalBytes / totalTime / 1024 / 1024).toFixed(2)
      : null;

  return (
    <Container>
      <Card style={{ marginTop: "50px" }}>
        <Row>
          <Col md={{ span: 6, offset: 3 }} style={{ marginTop: "30px" }}>
            <h2>Upload Large Video Files</h2>
          </Col>
        </Row>
        <Row>
          <Col md={{ span: 4, offset: 4 }} style={{ marginTop: "30px" }}>
            <input type="file" onChange={handleFileChange} />
          </Col>

          <Col md={{ span: 4, offset: 4 }} className="mt-3 mb-3">
            <Button variant="primary" onClick={handleUpload}>
              Upload
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              style={{ marginLeft: "10px" }}
            >
              Reset
            </Button>
          </Col>

          <Col md={{ span: 6, offset: 3 }} className="mb-3 mt-3">
            <ProgressBar
              animated={uploadProgress !== "100.00"}
              now={uploadProgress}
              label={
                <span style={{ fontWeight: "bold" }}>
                  Progress {uploadProgress}%
                </span>
              }
              style={{ height: "30px" }}
            />
          </Col>
          <Col md={{ span: 6, offset: 3 }} className="mb-3 mt-3">
            {uploadProgress >= 100 && (
              <>
                {!verificationStart && setVerificationStart(new Date())}

                <ProgressBar
                  animated={downloadLink.length === 0}
                  now={100}
                  variant="warning"
                  label={
                    <span style={{ fontWeight: "bold", color: "white" }}>
                      {downloadLink.length === 0
                        ? "Verifying File"
                        : "File is now available"}
                    </span>
                  }
                  style={{ height: "30px" }}
                />
                {downloadLink.length === 0 && (
                  <p style={{ fontSize: "12px" }}>
                    Verification takes about 3~7 minutes for larger files
                  </p>
                )}
              </>
            )}
          </Col>

          <Col md={{ span: 6, offset: 3 }} className="mb-3 mt-3">
            <UploadDetails
              uploadProgress={uploadProgress}
              uploadSpeed={uploadSpeed}
              averageSpeed={averageSpeed}
              selectedFile={selectedFile}
              error={error}
              downloadLink={downloadLink}
              uploadDuration={formattedUploadDuration}
              verificationDuration={formattedVerificationDuration}
            />
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default FileUpload;
