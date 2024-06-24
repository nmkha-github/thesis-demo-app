import { Box, Collapse, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { MdFileUpload } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import Colors from "../../lib/constants/colors";
import useAppSnackbar from "../../lib/hook/useAppSnackbar";
import TrackingSection from "./components/TrackingSection/TrackingSection";
import ReactPlayer from "react-player";

const HomePage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<ReactPlayer>(null);
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
        <Box style={{ width: 480 }}>
          <ReactPlayer
            ref={videoRef}
            url={!!file ? URL.createObjectURL(file) : ""}
            width={"100%"}
            height={340}
            style={{ display: !!file ? "block" : "none" }}
            controls
          />
          {!file && (
            <Box
              style={{
                height: 340,
                border: `1.5px dashed ${Colors.primary}`,
                borderRadius: 16,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => inputRef.current?.click()}
            >
              <MdFileUpload style={{ marginRight: 8 }} />
              <p>Upload File</p>
            </Box>
          )}

          <Box
            style={{
              padding: "8px 16px",
              background: Colors.primary1,
              marginTop: 28,
              marginBottom: 20,
              borderRadius: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>{file?.name}</Box>
            <IconButton
              onClick={() => setFile(undefined)}
              style={{ width: 40, height: 40 }}
            >
              <FaTrash color="black" />
            </IconButton>
          </Box>
        </Box>
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
          <TrackingSection videoRef={videoRef} file={file} />
        </Collapse>
      </Box>
    </Box>
  );
};

export default HomePage;
