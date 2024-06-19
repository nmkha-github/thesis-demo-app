import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";

interface ConfirmDialogContextProps {
  showConfirmDialog: (payload: {
    title: ReactNode;
    content: ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => Promise<void>;
  }) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextProps>({
  showConfirmDialog: async () => {},
});

interface ConfirmDialogContextProviderProps {
  children: React.ReactNode;
}

const ConfirmDialogProvider = ({
  children,
}: ConfirmDialogContextProviderProps) => {
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: ReactNode;
    content: ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => Promise<void>;
  }>();

  const showConfirmDialog = useCallback(
    ({
      title,
      content,
      confirmText,
      cancelText,
      onConfirm,
    }: {
      title: ReactNode;
      content: ReactNode;
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => Promise<void>;
    }) => {
      setConfirmDialogData({
        title: title,
        content: content,
        confirmText: confirmText,
        cancelText: cancelText,
        onConfirm: onConfirm,
      });
    },
    []
  );

  return (
    <ConfirmDialogContext.Provider
      value={{
        showConfirmDialog,
      }}
    >
      {children}
      {confirmDialogData && (
        <ConfirmDialog
          open={true}
          onClose={() => setConfirmDialogData(undefined)}
          title={confirmDialogData.title}
          content={confirmDialogData.content}
          confirmText={confirmDialogData.confirmText}
          cancelText={confirmDialogData.cancelText}
          onConfirm={confirmDialogData.onConfirm}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const store = useContext(ConfirmDialogContext);
  return store;
};

export default ConfirmDialogProvider;
