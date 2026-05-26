import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ConfirmOrganization from "./components/ConfirmOrganization";
import AcceptInvitation from "./components/AcceptInvitation";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminPanel from "./components/AdminPanel";
import Cabinet from "./components/Cabinet";
import LoginComp from "./components/LoginComp";
import OrganizationSelect from "./components/OrganizationSelect";
import AccountCreationRequest from "./components/AccountCreationRequest";
import type {
  AuthUser,
} from "./types/users.types";
import {
  clearCurrentOrgDetails,
  getCurrentOrgId,
  getCurrentOrgRole,
} from "./utils/getOrganisationsUtils";
import "./App.css";

const TOKEN_STORAGE_KEY = "accessToken";
const USER_STORAGE_KEY = "adminPanelUser";

const isRestrictedOrgRole = (role: string): boolean =>
  role === "STUDENT" || role === "USER";

function App() {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "",
  );
  const [, setCurrentUser] = useState<AuthUser | null>(() => {
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
  const [activeOrgRole, setActiveOrgRole] = useState(() => getCurrentOrgRole());

  const isOrgRestricted = activeOrgRole
    ? isRestrictedOrgRole(activeOrgRole)
    : false;

  const handleLoginSuccess = (token: string, nextUser: AuthUser) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    clearCurrentOrgDetails();
    setAccessToken(token);
    setCurrentUser(nextUser);
    setActiveOrganizationId("");
    setActiveOrgRole("");
  };

  const handleActivateSuccess = (token: string, nextUser: AuthUser) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    clearCurrentOrgDetails();
    setAccessToken(token);
    setCurrentUser(nextUser);
    setActiveOrganizationId("");
    setActiveOrgRole("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    clearCurrentOrgDetails();
    setAccessToken("");
    setCurrentUser(null);
    setActiveOrganizationId("");
    setActiveOrgRole("");
  };

  const handleOrganizationSelect = (orgId: string, role: string) => {
    setActiveOrganizationId(orgId);
    setActiveOrgRole(role);
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
                  ? activeOrganizationId
                    ? isOrgRestricted
                      ? "/cabinet"
                      : "/admin"
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
                  activeOrganizationId
                    ? isOrgRestricted
                      ? "/cabinet"
                      : "/admin"
                    : "/organizations"
                }
                replace
              />
            ) : (
              <LoginComp onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        {/* Открытый маршрут для создания заявки на организацию */}
        <Route
          path="/create-organization-request"
          element={<AccountCreationRequest />}
        />
        <Route
          path="/auth/activate"
          element={
            <ConfirmOrganization onActivateSuccess={handleActivateSuccess} />
          }
        />
        <Route
          path="/auth/invitation"
          element={<AcceptInvitation onAcceptSuccess={handleActivateSuccess} />}
        />
        <Route
          path="/organizations"
          element={
            accessToken ? (
              <OrganizationSelect
                onOrganizationSelect={handleOrganizationSelect}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cabinet"
          element={
            accessToken && activeOrganizationId && isOrgRestricted ? (
              <Cabinet onLogout={handleLogout} />
            ) : accessToken && activeOrganizationId && !isOrgRestricted ? (
              <Navigate to="/admin" replace />
            ) : accessToken ? (
              <Navigate to="/organizations" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            accessToken && activeOrganizationId && !isOrgRestricted ? (
              <AdminPanel
                currentOrgId={activeOrganizationId}
                onLogout={handleLogout}
              />
            ) : accessToken && activeOrganizationId && isOrgRestricted ? (
              <Navigate to="/cabinet" replace />
            ) : accessToken ? (
              <Navigate to="/organizations" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route
          path="*"
          element={
            <Navigate
              to={
                accessToken
                  ? activeOrganizationId
                    ? isOrgRestricted
                      ? "/cabinet"
                      : "/admin"
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
