import { createContext, useCallback, useContext, useState } from "react";
import useAppSnackbar from "../../../lib/hook/useAppSnackbar";
import ActionPredictInterface from "../../../lib/interfaces/ActionPredictInterface";
import VideoApi from "../../../lib/apis/VideoApi";

interface ActionContextProps {
  action: ActionPredictInterface;
  getAction: (file: File) => Promise<void>;
  actionLoading: boolean;
}

const ActionContext = createContext<ActionContextProps>({
  //init value
  action: {
    predict: "temp",
    probabilities: { thu: 3, test: 1, tam: 2 },
  },
  getAction: async () => { },
  actionLoading: false,
});

interface ActionContextProviderProps {
  children: React.ReactNode;
}

const ActionProvider = ({ children }: ActionContextProviderProps) => {
  //state
  const [action, setAction] = useState<ActionPredictInterface>({
    predict: "temp",
    probabilities: { thu: 3, test: 1, tam: 2 },
  });
  const [actionLoading, setActionLoading] = useState(false);

  //
  const { showSnackbarError } = useAppSnackbar();
  //function
  const getAction = useCallback(async (file: File) => {
    try {
      setActionLoading(true);
      const action = await VideoApi.actionPredict(file);
      setAction(action);
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setActionLoading(false);
    }
  }, []);
  //useEffect

  return (
    <ActionContext.Provider
      value={{
        action,

        getAction,
        actionLoading,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useAction = () => {
  const store = useContext(ActionContext);
  return store;
};

export default ActionProvider;
