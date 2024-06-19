import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppSnackbarProvider from "./lib/provider/AppSnackbarProvider";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import ConfirmDialogProvider from "./lib/provider/ConfirmDialogProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppSnackbarProvider>
      <BrowserRouter>
        <ConfirmDialogProvider>
          <AppRoutes />
        </ConfirmDialogProvider>
      </BrowserRouter>
    </AppSnackbarProvider>
  </React.StrictMode>
);
