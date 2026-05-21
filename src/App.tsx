import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ActivateInvitation from "./components/ActivateInvitation";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminPanel from "./components/AdminPanel";
import Cabinet from "./components/Cabinet";
import LoginComp from "./components/LoginComp";
import OrganizationSelect from "./components/OrganizationSelect";
import type { AuthUser, GlobalUserRole } from "./types/users.types";
import {
  clearCurrentOrgId,
  getCurrentOrgId,
} from "./utils/getOrganisationsUtils";
import "./App.css";

const TOKEN_STORAGE_KEY = "accessToken";
const USER_STORAGE_KEY = "adminPanelUser";

const isRestrictedRole = (role: GlobalUserRole): boolean =>
  role === "STUDENT" || role === "USER";

function App() {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "",
  );
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [activeOrganizationId, setActiveOrganizationId] = useState(() =>
    getCurrentOrgId(),
  );

  const isRestricted = currentUser
    ? isRestrictedRole(currentUser.globalRole)
    : false;

  const handleLoginSuccess = (token: string, nextUser: AuthUser) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    clearCurrentOrgId();
    setAccessToken(token);
    setCurrentUser(nextUser);
    setActiveOrganizationId("");
  };

  const handleActivateSuccess = (token: string, nextUser: AuthUser) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    clearCurrentOrgId();
    setAccessToken(token);
    setCurrentUser(nextUser);
    setActiveOrganizationId("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    clearCurrentOrgId();
    setAccessToken("");
    setCurrentUser(null);
    setActiveOrganizationId("");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                accessToken
                  ? isRestricted
                    ? "/cabinet"
                    : activeOrganizationId
                      ? "/admin"
                      : "/organizations"
                  : "/login"
              }
              replace
            />
          }
        />
        <Route
          path="/login"
          element={
            accessToken ? (
              <Navigate
                to={
                  isRestricted
                    ? "/cabinet"
                    : activeOrganizationId
                      ? "/admin"
                      : "/organizations"
                }
                replace
              />
            ) : (
              <LoginComp onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/auth/activate"
          element={
            <ActivateInvitation onActivateSuccess={handleActivateSuccess} />
          }
        />
        <Route
          path="/organizations"
          element={
            accessToken && !isRestricted ? (
              <OrganizationSelect
                onOrganizationSelect={setActiveOrganizationId}
              />
            ) : accessToken && isRestricted ? (
              <Navigate to="/cabinet" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cabinet"
          element={
            accessToken ? (
              <Cabinet onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
          <Route
            path="/admin"
            element={
              accessToken && activeOrganizationId && !isRestricted ? (
                <AdminPanel
                  currentOrgId={activeOrganizationId}
                  onLogout={handleLogout}
                />
              ) : accessToken && isRestricted ? (
                <Navigate to="/cabinet" replace />
              ) : accessToken ? (
                <Navigate to="/organizations" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/auth/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="*"
            element={
              <Navigate
                to={
                  accessToken
                    ? isRestricted
                      ? "/cabinet"
                      : activeOrganizationId
                        ? "/admin"
                        : "/organizations"
                    : "/login"
                }
                replace
              />
            }
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
