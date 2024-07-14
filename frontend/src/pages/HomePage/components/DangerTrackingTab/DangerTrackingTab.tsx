import { useEffect } from "react";
import { Box, BoxProps, Button, CircularProgress, Slider } from "@mui/material";
import ReactPlayer from "react-player";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDanger } from "../../provider/DangerProvider";

interface DangerTrackingTabProps {
  file?: File;
  videoRef: React.RefObject<ReactPlayer>;
}

export const DangerTrackingTab = ({
  file,
  videoRef,
  ...boxProps
}: DangerTrackingTabProps & BoxProps) => {
  const {
    dangerSegment,
    dangerSegmentLoading,
    threshold,
    setThreshold,
    getDangerSegment,
  } = useDanger();

  useEffect(() => {
    if (file) {
      getDangerSegment(file, threshold);
    }
  }, [file]);

  return (
    <Box style={{ ...boxProps.style }}>
      <Box
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box style={{ fontWeight: 600 }}>Threshold: </Box>
        <Slider
          value={threshold}
          onChange={(event, newValue) => setThreshold(newValue as number)}
          style={{ margin: "0px 8px" }}
        />
        <Box>{threshold}</Box>
      </Box>
      <Box style={{ height: 292 }}>
        {dangerSegmentLoading ? (
          <Box
            style={{
              paddingTop: 128,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <PerfectScrollbar>
            {dangerSegment["danger_segment"].map((segment, index) => (
              <Box
                key={`danger-segment-${index}`}
                style={{
                  marginBottom: 8,
                  padding: "8px 16px",
                  border: "1px solid rgba(0,0,0,0.4)",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.seekTo(segment.start, "seconds");
                  }
                }}
              >{`start: ${segment.start} seconds - end: ${segment.end} seconds`}</Box>
            ))}
          </PerfectScrollbar>
        )}
      </Box>
      <Box
        style={{
          marginTop: 16,
          width: "100%",
          display: "flex",
          flexDirection: "row-reverse",
        }}
      >
        <Button
          variant="outlined"
          onClick={async () => {
            if (file) {
              await getDangerSegment(file, threshold);
            }
          }}
        >
          Pretracking
        </Button>
      </Box>
    </Box>
  );
};
