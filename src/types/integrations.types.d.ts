export type IntegrationProvider =
  | 'TELEGRAM'
  | 'GOOGLE_CLASSROOM'
  | 'MOODLE'
  | 'DISCORD'
  | 'WHATSAPP'
  | 'ONE_C'

export type TelegramProvider = Extract<IntegrationProvider, 'TELEGRAM'>

export interface IntegrationUnitCatalog {
  provider: IntegrationProvider
  title: string
  category: string
  authType: string
  capabilities: string[]
}

export interface TelegramIntegrationConfig {
  [key: string]: unknown
  botUsername: string
  webhookSecret: string
  groupChatId?: string
}

export interface OrgIntegrationConfigDto {
  id: string
  organizationId: string
  provider: IntegrationProvider
  isActive: boolean
  config?: Record<string, unknown>
  secrets?: string
  createdAt?: string
  updatedAt?: string
}

export interface TelegramOrgIntegrationConfigDto
  extends Omit<OrgIntegrationConfigDto, 'provider' | 'config'> {
  provider: TelegramProvider
  config?: TelegramIntegrationConfig
}

export type Integration = OrgIntegrationConfigDto

export interface SaveIntegrationConfigRequest {
  provider: IntegrationProvider
  config: Record<string, unknown>
  secrets?: string
  isActive?: boolean
}

export interface SaveTelegramIntegrationRequest {
  provider: TelegramProvider
  config: TelegramIntegrationConfig
  secrets?: string
  isActive: boolean
}

export interface SaveOrgIntegrationConfigResultDto {
  id: string
  organizationId: string
  provider: IntegrationProvider
  isActive: boolean
}

export interface MemberExternalIdentityDto {
  id: string
  userId: string
  organizationId: string
  provider: IntegrationProvider
  externalId: string
  meta?: {
    username?: string
    firstName?: string
    lastName?: string
  } | null
  createdAt: string
}

export interface BindMemberExternalIdentityDto {
  userId: string
  provider: IntegrationProvider
  externalId: string
  meta?: Record<string, unknown> | null
}

export interface BindMemberExternalIdentityResultDto
  extends MemberExternalIdentityDto {}

export interface TelegramLinkResponseDto {
  url: string
  expiresAt: string
}
