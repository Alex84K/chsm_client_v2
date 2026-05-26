import apiClient from './apiClient'
import type {
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  ChangeMemberRoleRequest,
  ChangeMemberRoleResponse,
  GetOrganizationMembersResponse,
  InvitationResponse,
  SendInvitationRequest,
  UserOrganizationsResponse,
  VerifyInvitationResponse,
} from '../types/users.types'

export const getUserOrganizations = async (): Promise<UserOrganizationsResponse> => {
  const response = await apiClient.get<UserOrganizationsResponse>(
    '/auth/user/organizations',
  )
  return response.data
}

export const getOrganizationMembers = async (
  organizationId: string,
): Promise<GetOrganizationMembersResponse> => {
  const response = await apiClient.get<GetOrganizationMembersResponse>(
    `/organizations/${organizationId}/members`,
  )

  return response.data
}

export const sendOrganizationInvitation = async (
  organizationId: string,
  payload: SendInvitationRequest,
): Promise<InvitationResponse> => {
  const response = await apiClient.post<InvitationResponse>(
    `/organizations/${organizationId}/invitations`,
    payload,
  )

  return response.data
}

export const changeOrganizationMemberRole = async (
  organizationId: string,
  userId: string,
  payload: ChangeMemberRoleRequest,
): Promise<ChangeMemberRoleResponse> => {
  const response = await apiClient.patch<ChangeMemberRoleResponse>(
    `/organizations/${organizationId}/members/${userId}/role`,
    payload,
  )

  return response.data
}

export const removeUserOrganisation = async (
  organizationId: string,
  userId: string,
): Promise<ChangeMemberRoleResponse> => {
  const response = await apiClient.delete<ChangeMemberRoleResponse>(
    `/organizations/${organizationId}/members/${userId}`,
  )
  return response.data
}

export const verifyInvitation = async (
  token: string,
): Promise<VerifyInvitationResponse> => {
  const response = await apiClient.get<VerifyInvitationResponse>(
    '/auth/invitations/verify',
    {
      params: {
        token,
      },
    },
  )

  return response.data
}

export const acceptInvitation = async (
  payload: AcceptInvitationRequest,
): Promise<AcceptInvitationResponse> => {
  const response = await apiClient.post<AcceptInvitationResponse>(
    '/auth/invitations/accept',
    payload,
  )

  return response.data
}

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email })
}

export const resetPassword = async (
  token: string,
  password: string,
): Promise<void> => {
  await apiClient.post('/auth/reset-password', { token, password })
}
