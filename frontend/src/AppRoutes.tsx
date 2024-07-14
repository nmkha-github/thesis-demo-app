import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import ActionProvider from "./pages/HomePage/provider/ActionProvider";
import DangerProvider from "./pages/HomePage/provider/DangerProvider";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ActionProvider>
            <DangerProvider>
              <HomePage />
            </DangerProvider>
          </ActionProvider>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
