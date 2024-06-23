import { Box, BoxProps, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ActionTrackingTab from "../ActionTrackingTab/ActionTrackingTab";

interface TrackingSectionProps {
  file?: File;
}

const TrackingSection = ({
  file,
  ...boxProps
}: TrackingSectionProps & BoxProps) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box style={{ width: 600 }} {...boxProps}>
      <Tabs
        value={tabIndex}
        onChange={(event, newValue) => {
          setTabIndex(newValue);
        }}
        variant="fullWidth"
      >
        <Tab value={0} label="Action" />
        <Tab value={1} label="Danger" />
        <Tab value={2} label="Visualization" />
      </Tabs>
      <ActionTrackingTab
        file={file}
        style={{ display: tabIndex === 0 ? "block" : "none" }}
      />
    </Box>
  );
};

export default TrackingSection;
