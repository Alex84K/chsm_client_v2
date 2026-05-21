export type GlobalUserRole =
  | 'USER'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'MANAGER'

export type OrganizationMemberRole =
  | 'USER'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'MANAGER'

export type AuthUser = {
  id: string
  email: string
  name: string | null
  globalRole: GlobalUserRole
}

export type OrganizationMemberUser = {
  id: string
  email: string
  name: string | null
  globalRole: string
}

export type OrganizationMember = {
  id: string
  userId: string
  role: OrganizationMemberRole
  createdAt: string
  user: OrganizationMemberUser
}

export type GetOrganizationMembersResponse = OrganizationMember[]

export type UserOrganizationItem = {
  id: string
  name: string
  slug: string
  role: OrganizationMemberRole
  joinedAt: string
}

export type UserOrganizationsResponse = UserOrganizationItem[]

export type InvitationRole = 'STUDENT' | 'USER'

export type SendInvitationRequest = {
  email: string
  role: InvitationRole
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED'

export type InvitationResponse = {
  id: string
  email: string
  role: InvitationRole
  organizationId: string
  status: InvitationStatus
  expiresAt: string
}

export type VerifyInvitationResponse = {
  email: string
  organizationName: string
  role: InvitationRole
}

export type AcceptInvitationRequest = {
  token: string
  password: string
  name?: string
}

export type AcceptInvitationResponse = {
  accessToken: string
  user: AuthUser
}

export type UsersQueryError = {
  status?: number
  message: string
}

export interface AccountCreationRequest {
  applicantName: string,
  applicantEmail: string,
  organizationName: string
}
