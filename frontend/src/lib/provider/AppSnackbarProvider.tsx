import { SnackbarProvider } from "notistack";
import { ReactNode } from "react";

function AppSnackbarProvider({ children }: { children: ReactNode }) {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      iconVariant={{
        success: "✅",
        error: "✖️",
        warning: "⚠️",
        info: "ℹ️",
      }}
      maxSnack={3}
    >
      {children}
    </SnackbarProvider>
  );
}

export default AppSnackbarProvider;
