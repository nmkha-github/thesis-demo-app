import { Button, ButtonProps } from "@mui/material";
import { useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const stepsStart = [
  {
    target: "#uploadVideo",
    content: "Upload Video here",
    disableBeacon: true,
  },
  {
    target: "#removeVideo",
    content:
      "Video name will be here, you can remove it by clicking trashcan button",
    floaterProps: {
      disableAnimation: true,
    },
  },
  {
    target: "#boneVisual",
    content: "Switch between raw video and pose visualization",
    floaterProps: {
      disableAnimation: true,
    },
  },
  {
    target: "#zeroShot",
    content: "Action recognition by zero-shot method Tab",
  },
  {
    target: "#dangerTracking",
    content:
      "Recognize danger Tab. You can change threshold by pulling this slider and pretracking with new threshold value",
  },
  {
    target: "#attentionMap",
    content: "Attention Map Tab",
  },
];

interface HelpState {
  run: boolean;
  steps: Step[];
}

const JoyrideButton = ({ ...buttonProps }: ButtonProps) => {
  // Joyride
  const [{ run, steps }, setState] = useState<HelpState>({
    run: false,
    steps: stepsStart,
  });

  const handleClickHelp = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setState({ run: true, steps });
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setState({ run: false, steps });
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClickHelp}
        style={{ ...buttonProps.style }}
      >
        Help
      </Button>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={run}
        scrollToFirstStep
        showSkipButton
        steps={steps}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
    </>
  );
};

export default JoyrideButton;
