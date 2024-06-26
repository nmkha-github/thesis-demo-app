import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import ActionProvider from "./pages/HomePage/provider/ActionProvider";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ActionProvider>
            <HomePage />
          </ActionProvider>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
