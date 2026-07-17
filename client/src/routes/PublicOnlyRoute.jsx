import {
  Navigate,
  Outlet,
} from "react-router-dom";

import LoadingScreen from "../components/common/LoadingScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function PublicOnlyRoute() {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}