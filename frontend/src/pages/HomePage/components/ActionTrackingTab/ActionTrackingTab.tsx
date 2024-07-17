import { Box, BoxProps, CircularProgress } from "@mui/material";
import useAppSnackbar from "../../../../lib/hook/useAppSnackbar";
import { useEffect, useState } from "react";
import VideoApi from "../../../../lib/apis/VideoApi";
import ActionPredictInterface from "../../../../lib/interfaces/ActionPredictInterface";
import { useAction } from "../../provider/ActionProvider";

interface ActionTrackingTabProps {
  file?: File;
}

const ActionTrackingTab = ({
  file,
  ...boxProps
}: ActionTrackingTabProps & BoxProps) => {
  const { action, actionLoading, getAction } = useAction();

  useEffect(() => {
    if (file) {
      getAction(file);
    }
  }, [file]);

  return (
    <Box {...boxProps}>
      {actionLoading ? (
        <Box
          style={{ marginTop: 128, display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box
            style={{ fontWeight: 600 }}
          >{`Action predict: ${action.predict}`}</Box>
          {Object.entries(action.probabilities)
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
