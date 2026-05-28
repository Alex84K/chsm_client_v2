export const getCurrentUser = (): string => {
    return sessionStorage.getItem('adminPanelUser') ?? ""
  }