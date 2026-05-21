const CURRENT_ORG_ID_KEY = 'currentOrgId'

export let currentOrgId = sessionStorage.getItem(CURRENT_ORG_ID_KEY) ?? ''

export const getCurrentOrgId = () => {
  currentOrgId = sessionStorage.getItem(CURRENT_ORG_ID_KEY) ?? ''
  return currentOrgId
}

export const setCurrentOrgId = (organizationId: string) => {
  currentOrgId = organizationId
  sessionStorage.setItem(CURRENT_ORG_ID_KEY, organizationId)
}

export const clearCurrentOrgId = () => {
  currentOrgId = ''
  sessionStorage.removeItem(CURRENT_ORG_ID_KEY)
}
