import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';

const stepsStart = [
    {
        target: "#uploadVideo",
        content: "Upload Video here",
    },
    {
        target: "#removeVideo",
        content: "Remove video",
    },
    {
        target: "#boneVisual",
        content: "Bone visual",
    },
];

export const JoyrideStartProvider = () => {

    return (
        <Joyride
            steps={stepsStart}
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            styles={{
                options: {
                    zIndex: 10000,
                },
            }}
        />
    );
};

const stepsTracking = [
    {
        target: "#zeroShot",
        content: "Action recognition by zero-shot method",
    },
    {
        target: "#dangerTracking",
        content: "Recognize danger",
    },
    {
        target: "#attentionMap",
        content: "Attention Map",
    },
];


export const JoyrideTrackingProvider: React.FC = () => {
    const [run, setRun] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRun(true);
        }, 1000);

        return () => clearTimeout(timer); // Cleanup timer nếu component unmount
    }, []);

    return (
        <Joyride
            steps={stepsTracking}
            run={run}
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            styles={{
                options: {
                    zIndex: 10000,
                },
            }}
        />
    );
};