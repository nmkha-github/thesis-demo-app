import { Box, Collapse } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Colors from "../../lib/constants/colors";
import useAppSnackbar from "../../lib/hook/useAppSnackbar";
import TrackingSection from "./components/TrackingSection/TrackingSection";
import ReactPlayer from "react-player";
import VideoSection from "./components/VideoSection/VideoSection";
import JoyrideButton from "./components/JoyrideButton/JoyrideButton";

const HomePage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<ReactPlayer>(null);
  const poseVideoRef = useRef<ReactPlayer>(null);
  const [file, setFile] = useState<File>();
  const [trackingOpen, setTrackingOpen] = useState(false);
  const { showSnackbarError } = useAppSnackbar();

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const fileType = file.name.split(".").pop();
      if (!["mp4", "avi", "mov"].includes(fileType ?? "")) {
        showSnackbarError("File must be a video");
        return;
      }

      setFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    if (file) {
      setTrackingOpen(true);
    }
  }, [file]);

  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <JoyrideButton style={{ position: "absolute", right: 32, top: 32 }} />
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={uploadFile}
        onClick={(event) => {
          event.currentTarget.value = "";
        }}
      />

      <Box
        style={{
          boxShadow: "rgba(99, 99, 99, 0.4) 0px 2px 8px 0px",
          padding: 16,
          display: "flex",
        }}
      >
        <VideoSection
          file={file}
          videoRef={videoRef}
          poseVideoRef={poseVideoRef}
          onUpload={() => inputRef.current?.click()}
          onRemoveFile={() => setFile(undefined)}
        />

        {trackingOpen && (
          <Box
            style={{
              width: 1,
              margin: "0px 8px",
              borderRight: `1.5px solid ${Colors.primary}`,
            }}
          />
        )}

        <Collapse in={trackingOpen} timeout={"auto"} orientation="horizontal">
          <TrackingSection
            videoRef={videoRef}
            poseVideoRef={poseVideoRef}
            file={file}
          />
        </Collapse>
      </Box>
    </Box>
  );
};

export default HomePage;
