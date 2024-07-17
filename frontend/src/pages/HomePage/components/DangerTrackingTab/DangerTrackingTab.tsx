import { useEffect } from "react";
import { Box, BoxProps, Button, CircularProgress, Slider } from "@mui/material";
import { styled } from '@mui/material/styles';
import ReactPlayer from "react-player";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDanger } from "../../provider/DangerProvider";

interface DangerTrackingTabProps {
  file?: File;
  videoRef: React.RefObject<ReactPlayer>;
  poseVideoRef: React.RefObject<ReactPlayer>;
}

const CustomSlider = styled(Slider)({
  '& .MuiSlider-thumb': {
    display: 'none',
  },
  '& .MuiSlider-track': {
    height: '8px',
    borderRadius: '4px',
  },
  '& .MuiSlider-rail': {
    height: '8px',
    borderRadius: '4px',
  },
});

export const DangerTrackingTab = ({
  file,
  videoRef,
  poseVideoRef,
  ...boxProps
}: DangerTrackingTabProps & BoxProps) => {
  const {
    dangerSegment,
    dangerSegmentLoading,
    threshold,
    setThreshold,
    getDangerSegment,
  } = useDanger();

  const getColor = (value: number) => {
    if (value < 30) {
      return '#76f480';
    }
    else if (value < 70) {
      return '#ffbe73';
    }
    else {
      return '#eb4f4f';
    }
  };

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
        <CustomSlider
          value={threshold}
          onChange={(event, newValue) => setThreshold(newValue as number)}
          style={{ margin: "0px 8px" }}
          sx={{
            color: getColor(threshold),
          }}
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
                  if (poseVideoRef.current) {
                    poseVideoRef.current.seekTo(segment.start, "seconds");
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
          style={{ marginTop: 45 }}
        >
          Pretracking
        </Button>
      </Box>
    </Box >
  );
};
