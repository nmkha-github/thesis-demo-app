import { Box, BoxProps, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ActionTrackingTab from "../ActionTrackingTab/ActionTrackingTab";
import { DangerTrackingTab } from "../DangerTrackingTab/DangerTrackingTab";
import ReactPlayer from "react-player";
import VisualizationTab from "../VisualizationTab/VisualizationTab";

interface TrackingSectionProps {
  file?: File;
  videoRef: React.RefObject<ReactPlayer>;
  poseVideoRef: React.RefObject<ReactPlayer>;
}

const TrackingSection = ({
  file,
  videoRef,
  poseVideoRef,
  ...boxProps
}: TrackingSectionProps & BoxProps) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box style={{ width: 540 }} {...boxProps}>
      <Tabs
        value={tabIndex}
        onChange={(event, newValue) => {
          setTabIndex(newValue);
        }}
        variant="fullWidth"
      >
        <Tab
          value={0}
          label="Zeroshot"
          id="zeroShot"
          style={{ backgroundColor: "white" }}
        />
        <Tab
          value={1}
          label="Danger Tracking"
          id="dangerTracking"
          style={{ backgroundColor: "white" }}
        />
        <Tab
          value={2}
          label="Attention Map"
          id="attentionMap"
          style={{ backgroundColor: "white" }}
        />
      </Tabs>

      <ActionTrackingTab
        file={file}
        style={{ display: tabIndex === 0 ? "block" : "none" }}
      />

      <DangerTrackingTab
        file={file}
        videoRef={videoRef}
        poseVideoRef={poseVideoRef}
        style={{ display: tabIndex === 1 ? "block" : "none" }}
      />

      <VisualizationTab
        file={file}
        style={{ display: tabIndex === 2 ? "block" : "none" }}
      />
    </Box>
  );
};

export default TrackingSection;
