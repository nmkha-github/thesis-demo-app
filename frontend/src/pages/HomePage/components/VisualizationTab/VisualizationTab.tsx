import { Box, BoxProps, CircularProgress } from "@mui/material";
import { useAction } from "../../provider/ActionProvider";
import { useEffect, useState } from "react";
import useAppSnackbar from "../../../../lib/hook/useAppSnackbar";
import VideoApi from "../../../../lib/apis/VideoApi";
import ReactPlayer from "react-player";

interface VisualizationTabProps {
  file?: File;
}

const VisualizationTab = ({
  file,
  ...boxProps
}: VisualizationTabProps & BoxProps) => {
  const { action, actionLoading } = useAction();
  const [visualizing, setVisualizing] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const { showSnackbarError } = useAppSnackbar();

  const getVisualization = async (file: File, action: string) => {
    try {
      setVisualizing(true);
      const visualizationResponse = await VideoApi.visualization(file, action);
      const url = URL.createObjectURL(visualizationResponse);
      setVideoUrl(url);
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setVisualizing(false);
    }
  };

  useEffect(() => {
    if (file && action.predict) {
      getVisualization(file, action.predict);
    }
  }, [action]);

  return (
    <Box {...boxProps}>
      {actionLoading || visualizing ? (
        <Box
          style={{ marginTop: 128, display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box style={{ marginTop: 32 }}>
          <ReactPlayer url={videoUrl} width={"100%"} height={340} controls />
        </Box>
      )}
    </Box>
  );
};

export default VisualizationTab;
