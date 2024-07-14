import { createContext, useCallback, useContext, useState } from "react";
import useAppSnackbar from "../../../lib/hook/useAppSnackbar";
import DangerPredictInterface from "../../../lib/interfaces/DangerPredictInterface";
import VideoApi from "../../../lib/apis/VideoApi";

interface DangerContextProps {
  dangerSegment: DangerPredictInterface;
  threshold: number;
  setThreshold: React.Dispatch<React.SetStateAction<number>>;
  getDangerSegment: (file: File, threshold: number) => Promise<void>;
  dangerSegmentLoading: boolean;
}

const DangerContext = createContext<DangerContextProps>({
  //init value
  dangerSegment: {
    danger_segment:[]
  },
  threshold: 85,
  setThreshold: () => {},
  getDangerSegment: async () => {},
  dangerSegmentLoading: false,
});

interface DangerContextProviderProps {
  children: React.ReactNode;
}

const DangerProvider = ({ children }: DangerContextProviderProps) => {
  //state
  const [dangerSegment, setDangerSegment] = useState<DangerPredictInterface>({
        danger_segment:[]
  });
  const [threshold, setThreshold] =useState(85)
  const [dangerSegmentLoading, setDangerSegmentLoading] = useState(false);

  //
  const { showSnackbarError } = useAppSnackbar();
  //function
  const getDangerSegment = useCallback(async (file: File, threshold: number) => {
    try {
         setDangerSegmentLoading(true);
      const dangerSegment = await VideoApi.dangerPredict(file, threshold);
      setDangerSegment(dangerSegment);
    } catch (error) {
      showSnackbarError(error);
    } finally {
        setDangerSegmentLoading(false);
    }
  }, []);
  //useEffect

  return (
    <DangerContext.Provider
      value={{
        dangerSegment,

        threshold,
        setThreshold,

        getDangerSegment,
        dangerSegmentLoading,
      }}
    >
      {children}
    </DangerContext.Provider>
  );
};

export const useDanger = () => {
  const store = useContext(DangerContext);
  return store;
};

export default DangerProvider;
