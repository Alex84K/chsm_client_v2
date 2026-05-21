import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { getUserOrganizations } from '../api/users.api'
import type {
  UserOrganizationsResponse,
  UsersQueryError,
} from '../types/users.types'

const getErrorMessage = (status?: number) => {
  if (status === 401) {
    return 'Сессия истекла или токен отсутствует. Выполните вход повторно.'
  }

  return 'Не удалось загрузить список доступных организаций.'
}

const mapOrganizationsError = (error: unknown): UsersQueryError => {
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

export const useUserOrganizations = () =>
  useQuery<UserOrganizationsResponse, UsersQueryError>({
    queryKey: ['user-organizations'],
    queryFn: async () => {
      try {
        return await getUserOrganizations()
      } catch (error) {
        throw mapOrganizationsError(error)
      }
    },
    retry: false,
    select: (organizations) =>
      [...organizations].sort((firstOrganization, secondOrganization) =>
        firstOrganization.name.localeCompare(secondOrganization.name),
      ),
  })
