import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { getOrganizationMembers } from '../api/users.api'
import type {
  GetOrganizationMembersResponse,
  UsersQueryError,
} from '../types/users.types'

const getErrorMessage = (status?: number) => {
  if (status === 401) {
    return 'Сессия истекла или токен отсутствует. Выполните вход повторно.'
  }

  if (status === 403) {
    return 'У вас недостаточно прав для просмотра списка участников данной организации'
  }

  return 'Не удалось загрузить список участников организации.'
}

export const useOrganizationMembers = (organizationId: string) =>
  useQuery<GetOrganizationMembersResponse, UsersQueryError>({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      try {
        return await getOrganizationMembers(organizationId)
      } catch (error) {
        throw mapMembersError(error)
      }
    },
    enabled: Boolean(organizationId),
    throwOnError: false,
    retry: false,
    select: (members) =>
      [...members].sort(
        (firstMember, secondMember) =>
          Date.parse(secondMember.createdAt) - Date.parse(firstMember.createdAt),
      ),
    meta: {
      errorMessage: 'Не удалось загрузить список участников организации.',
    },
  })

export const mapMembersError = (error: unknown): UsersQueryError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    return {
      status,
      message: getErrorMessage(status),
    }
  }

  return {
    message: getErrorMessage(),
  }
}
