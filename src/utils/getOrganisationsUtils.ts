const CURRENT_ORG_ID_KEY = "currentOrgId";
const CURRENT_ORG_ROLE_KEY = "currentOrgRole";

export let currentOrgId = sessionStorage.getItem(CURRENT_ORG_ID_KEY) ?? "";
export let currentOrgRole = sessionStorage.getItem(CURRENT_ORG_ROLE_KEY) ?? "";

export const getCurrentOrgId = () => {
  currentOrgId = sessionStorage.getItem(CURRENT_ORG_ID_KEY) ?? "";
  return currentOrgId;
};

export const getCurrentOrgRole = () => {
  currentOrgRole = sessionStorage.getItem(CURRENT_ORG_ROLE_KEY) ?? "";
  return currentOrgRole;
};

export const setCurrentOrgDetails = (organizationId: string, role: string) => {
  currentOrgId = organizationId;
  currentOrgRole = role;
  sessionStorage.setItem(CURRENT_ORG_ID_KEY, organizationId);
  sessionStorage.setItem(CURRENT_ORG_ROLE_KEY, role);
};

export const clearCurrentOrgDetails = () => {
  currentOrgId = "";
  currentOrgRole = "";
  sessionStorage.removeItem(CURRENT_ORG_ID_KEY);
  sessionStorage.removeItem(CURRENT_ORG_ROLE_KEY);
};

export const getOrganisationId = (): string => {
  return sessionStorage.getItem(CURRENT_ORG_ID_KEY) ?? ""
}
