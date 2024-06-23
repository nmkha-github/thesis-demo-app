import { Box, BoxProps, CircularProgress } from "@mui/material";
import useAppSnackbar from "../../../../lib/hook/useAppSnackbar";
import { useEffect, useState } from "react";
import VideoApi from "../../../../lib/apis/VideoApi";
import ActionPredictInterface from "../../../../lib/interfaces/ActionPredictInterface";
import Colors from "../../../../lib/constants/colors";

interface ActionTrackingTabProps {
  file?: File;
}

const ActionTrackingTab = ({
  file,
  ...boxProps
}: ActionTrackingTabProps & BoxProps) => {
  const [loading, setLoading] = useState(false);
  const [predictAction, setPredictAction] = useState<ActionPredictInterface>();

  const { showSnackbarError } = useAppSnackbar();

  const getPredictAction = async (file: File) => {
    try {
      setLoading(true);
      const action = await VideoApi.actionPredict(file);
      setPredictAction(action);
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setLoading(loading);
    }
  };

  useEffect(() => {
    if (file) {
      getPredictAction(file);
    }
  }, [file]);

  if (!predictAction) return null;

  return loading ? (
    <Box style={{ marginTop: 128, display: "flex", justifyContent: "center" }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box {...boxProps}>
      <Box
        style={{ fontWeight: 600 }}
      >{`Action predict: ${predictAction.predict}`}</Box>
      {Object.keys(predictAction.probabilities).map((key, i) => (
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <Box>{key}:</Box>
          <Box>{`${(predictAction.probabilities[key] * 100).toFixed(2)}%`}</Box>
        </Box>
      ))}
    </Box>
  );
};

export default ActionTrackingTab;
