import { Box, BoxProps, CircularProgress } from "@mui/material";
import useAppSnackbar from "../../../../lib/hook/useAppSnackbar";
import { useEffect, useState } from "react";
import VideoApi from "../../../../lib/apis/VideoApi";
import ActionPredictInterface from "../../../../lib/interfaces/ActionPredictInterface";

interface ActionTrackingTabProps {
  file?: File;
}

const ActionTrackingTab = ({
  file,
  ...boxProps
}: ActionTrackingTabProps & BoxProps) => {
  const [loading, setLoading] = useState(false);
  const [predictAction, setPredictAction] = useState<ActionPredictInterface>({
    predict: "",
    probabilities: {},
  });

  const { showSnackbarError } = useAppSnackbar();

  const getPredictAction = async (file: File) => {
    try {
      setLoading(true);
      const action = await VideoApi.actionPredict(file);
      setPredictAction(action);
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file) {
      console.log(file.name);
      getPredictAction(file);
    }
  }, [file]);

  return (
    <Box {...boxProps}>
      {loading ? (
        <Box
          style={{ marginTop: 128, display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box
            style={{ fontWeight: 600 }}
          >{`Action predict: ${predictAction.predict}`}</Box>
          {Object.entries(predictAction.probabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([key, value], i) => (
              <Box
                key={`action-${i}`}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Box>{key}:</Box>
                <Box>{`${(value * 100).toFixed(2)}%`}</Box>
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default ActionTrackingTab;
