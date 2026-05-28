import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  deleteExternalIdentity,
  deleteIntegrationConfig,
  getIntegrationsListByOrganisation,
  getStudentTelegramLink,
  saveTelegramIntegrationConfig,
} from '../api/integrations.api'
import type {
  Integration,
  SaveTelegramIntegrationRequest,
  TelegramLinkResponseDto,
  TelegramOrgIntegrationConfigDto,
} from '../types/integrations.types'
import type { UsersQueryError } from '../types/users.types'

type SaveTelegramVariables = {
  orgId: string
  payload: SaveTelegramIntegrationRequest
}

type DeleteIntegrationVariables = {
  orgId: string
  integrationId: string
}

const getErrorMessage = (status?: number, fallback?: string) => {
  if (fallback) {
    return fallback
  }

  if (status === 400) {
    return 'Проверьте настройки интеграции.'
  }

  if (status === 401) {
    return 'Сессия истекла. Выполните вход повторно.'
  }

  if (status === 404) {
    return 'Интеграция не найдена.'
  }

  if (status === 409) {
    return 'Эта внешняя учетная запись уже привязана.'
  }

  return 'Не удалось выполнить действие с интеграцией.'
}

export const mapIntegrationError = (error: unknown): UsersQueryError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const responseMessage = error.response?.data?.message
    const message = Array.isArray(responseMessage)
      ? responseMessage.join(' ')
      : typeof responseMessage === 'string'
        ? responseMessage
        : undefined

    return {
      status,
      message: getErrorMessage(status, message),
    }
  }

  return {
    message: getErrorMessage(),
  }
}

export const useIntegrations = (orgId: string) =>
  useQuery<Integration[], UsersQueryError>({
    queryKey: ['integrations', orgId],
    queryFn: async () => {
      try {
        return await getIntegrationsListByOrganisation(orgId)
      } catch (error) {
        throw mapIntegrationError(error)
      }
    },
    enabled: Boolean(orgId),
    retry: false,
  })

export const useSaveTelegramIntegration = () => {
  const queryClient = useQueryClient()

  return useMutation<
    TelegramOrgIntegrationConfigDto,
    UsersQueryError,
    SaveTelegramVariables
  >({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await saveTelegramIntegrationConfig(orgId, payload)
      } catch (error) {
        throw mapIntegrationError(error)
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['integrations', orgId] })
    },
  })
}

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, DeleteIntegrationVariables>({
    mutationFn: async ({ orgId, integrationId }) => {
      try {
        await deleteIntegrationConfig(orgId, integrationId)
      } catch (error) {
        throw mapIntegrationError(error)
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['integrations', orgId] })
    },
  })
}

export const useDeleteExternalIdentity = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, string>({
    mutationFn: async (identityId) => {
      try {
        await deleteExternalIdentity(identityId)
      } catch (error) {
        throw mapIntegrationError(error)
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-organizations'] })
    },
  })
}

// Добавьте 'string' как третий аргумент в useMutation <Data, Error, Variables>
export const useTelegramLink = () =>
  useMutation<TelegramLinkResponseDto, UsersQueryError, string>({
    mutationFn: async (orgId: string) => {
      try {
        return await getStudentTelegramLink(orgId)
      } catch (error) {
        throw mapIntegrationError(error)
      }
    },
  })
