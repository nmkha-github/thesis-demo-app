import Switch, { switchClasses } from "@mui/joy/Switch";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import Colors from "../../../../lib/constants/colors";
import { MdFileUpload, MdOndemandVideo } from "react-icons/md";
import { VscServerProcess } from "react-icons/vsc";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Theme } from "@mui/joy";
import VideoApi from "../../../../lib/apis/VideoApi";
import useAppSnackbar from "../../../../lib/hook/useAppSnackbar";

interface VideoSectionProps {
  file?: File;
  videoRef?: React.LegacyRef<ReactPlayer>;
  poseVideoRef?: React.LegacyRef<ReactPlayer>;
  onUpload?: () => void;
  onRemoveFile?: () => void;
}

const VideoSection = ({
  file,
  videoRef,
  poseVideoRef,
  onUpload,
  onRemoveFile,
}: VideoSectionProps) => {
  const [poseMode, setPoseMode] = useState(false);
  const [poseVideoUrl, setPoseVideoUrl] = useState("");
  const [loadingPose, setLoadingPose] = useState(false);

  const { showSnackbarError } = useAppSnackbar();

  const RawVideo = useMemo(
    () => (
      <ReactPlayer
        ref={videoRef}
        url={!!file ? URL.createObjectURL(file) : ""}
        width={"100%"}
        height={340}
        style={{ display: !!file ? "block" : "none" }}
        controls
      />
    ),
    [file]
  );

  const PoseVideo = useMemo(
    () => (
      <ReactPlayer
        ref={poseVideoRef}
        url={poseVideoUrl}
        width={"100%"}
        height={340}
        controls
      />
    ),
    [poseVideoUrl]
  );

  const getPose = async (file: File) => {
    try {
      setLoadingPose(true);
      const poseResponse = await VideoApi.poseExtraction(file);
      const url = URL.createObjectURL(poseResponse);
      setPoseVideoUrl(url);
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setLoadingPose(false);
    }
  };

  useEffect(() => {
    if (file) {
      getPose(file);
      setPoseMode(true);
    }
  }, [file]);

  return (
    <Box style={{ width: 560 }}>
      <Box sx={{ display: !poseMode ? "block" : "none" }}>{RawVideo}</Box>

      {loadingPose && poseMode && (
        <Box
          sx={{
            height: 340,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ display: !loadingPose && poseMode ? "block" : "none" }}>
        {PoseVideo}
      </Box>

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
          onClick={onUpload}
        >
          <MdFileUpload style={{ marginRight: 8 }} />
          <p>Upload File</p>
        </Box>
      )}

      <Box
        style={{
          paddingTop: 16,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Switch
          disabled={!file}
          checked={poseMode}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setPoseMode(event.target.checked)
          }
          slotProps={{
            thumb: {
              children: poseMode ? (
                <VscServerProcess size={22} />
              ) : (
                <MdOndemandVideo size={22} />
              ),
            },
          }}
          sx={(theme: Theme) => ({
            "--Switch-thumbShadow": "0 3px 7px 0 rgba(0 0 0 / 0.12)",
            "--Switch-thumbSize": "28px",
            "--Switch-trackWidth": "60px",
            "--Switch-trackHeight": "32px",
            "--Switch-trackBackground": theme.vars.palette.background.level3,
            [`& .${switchClasses.thumb}`]: {
              transition: "width 0.2s, left 0.2s",
            },
            "&:hover": {
              "--Switch-trackBackground": theme.vars.palette.background.level3,
            },
            "&:active": {
              "--Switch-thumbWidth": "32px",
            },
            [`&.${switchClasses.checked}`]: {
              "--Switch-trackBackground": Colors.primary,
              "&:hover": {
                "--Switch-trackBackground": Colors.primary,
              },
            },
          })}
        />
      </Box>

      <Box
        style={{
          padding: "8px 16px",
          background: Colors.primary1,
          marginTop: 20,
          marginBottom: 20,
          borderRadius: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>{file?.name}</Box>
        <IconButton
          onClick={() => {
            onRemoveFile?.();
            setPoseMode(false);
          }}
          style={{ width: 40, height: 40 }}
        >
          <FaTrash color="black" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default VideoSection;
