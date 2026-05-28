import type {
    BindMemberExternalIdentityDto,
    BindMemberExternalIdentityResultDto,
    Integration,
    IntegrationUnitCatalog,
    MemberExternalIdentityDto,
    SaveIntegrationConfigRequest,
    SaveTelegramIntegrationRequest,
    TelegramLinkResponseDto,
    TelegramOrgIntegrationConfigDto,
} from '../types/integrations.types'
import apiClient from './apiClient'

export const getIntegrationsCatalog = async (): Promise<IntegrationUnitCatalog[]> => {
    const response = await apiClient.get<IntegrationUnitCatalog[]>(
        '/organizations/any/integrations/catalog',
    )
    return response.data
}

export const getIntegrationsListByOrganisation = async (
    orgId: string,
): Promise<Integration[]> => {
    const response = await apiClient.get<Integration[]>(
        `/organizations/${orgId}/integrations`,
    )
    return response.data
}

export const saveIntegrationConfig = async (
    orgId: string,
    payload: SaveIntegrationConfigRequest,
): Promise<Integration> => {
    const response = await apiClient.post<Integration>(
        `/organizations/${orgId}/integrations`,
        payload,
    )
    return response.data
}

export const saveTelegramIntegrationConfig = async (
    orgId: string,
    payload: SaveTelegramIntegrationRequest,
): Promise<TelegramOrgIntegrationConfigDto> => {
    const response = await apiClient.post<TelegramOrgIntegrationConfigDto>(
        `/organizations/${orgId}/integrations`,
        payload,
    )
    return response.data
}

export const deleteIntegrationConfig = async (
    orgId: string,
    integrationId: string,
): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/integrations/${integrationId}`)
}

export const bindMemberExternalIdentity = async (
    orgId: string,
    payload: BindMemberExternalIdentityDto,
): Promise<BindMemberExternalIdentityResultDto> => {
    const response = await apiClient.post<BindMemberExternalIdentityResultDto>(
        `/organizations/${orgId}/identities`,
        payload,
    )
    return response.data
}

export const deleteExternalIdentity = async (identityId: string): Promise<void> => {
    await apiClient.delete(`/identities/${identityId}`)
}

export const getStudentTelegramLink = async (
    orgId: string,
): Promise<TelegramLinkResponseDto> => {
    const response = await apiClient.get<TelegramLinkResponseDto>(
        `/organizations/${orgId}/students/me/telegram-link`,
    )
    return response.data
}

export const isTelegramIntegration = (
    integration: Integration,
): integration is TelegramOrgIntegrationConfigDto =>
    integration.provider === 'TELEGRAM'

export const getTelegramIntegration = (
    integrations: Integration[],
): TelegramOrgIntegrationConfigDto | undefined =>
    integrations.find(isTelegramIntegration)

export const getTelegramIdentity = (
    identities: MemberExternalIdentityDto[] = [],
): MemberExternalIdentityDto | undefined =>
    identities.find((identity) => identity.provider === 'TELEGRAM')

export const getStudentIdentities = async (orgId: string): Promise<any[]> => {
    const response = await apiClient.get(`/organizations/${orgId}/students/me/identities`);
    return response.data;
};