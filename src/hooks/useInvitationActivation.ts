import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { acceptInvitation, verifyInvitation } from '../api/users.api'
import type {
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  UsersQueryError,
  VerifyInvitationResponse,
} from '../types/users.types'

const getVerifyErrorMessage = (status?: number) => {
  if (status === 400 || status === 404) {
    return 'Ссылка недействительна или срок её действия истек. Запросите новое приглашение у администратора организации.'
  }

  return 'Не удалось проверить приглашение. Попробуйте позже.'
}

const getAcceptErrorMessage = (status?: number) => {
  if (status === 400 || status === 404) {
    return 'Не удалось подтвердить приглашение. Проверьте данные и попробуйте снова.'
  }

  return 'Не удалось завершить регистрацию. Попробуйте позже.'
}

const mapActivationError = (
  error: unknown,
  getMessage: (status?: number) => string,
): UsersQueryError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    return {
      status,
      message: getMessage(status),
    }
  }

  return {
    message: getMessage(),
  }
}

export const useVerifyInvitation = (token: string) =>
  useQuery<VerifyInvitationResponse, UsersQueryError>({
    queryKey: ['verify-invitation', token],
    queryFn: async () => {
      try {
        return await verifyInvitation(token)
      } catch (error) {
        throw mapActivationError(error, getVerifyErrorMessage)
      }
    },
    enabled: Boolean(token),
    retry: false,
  })

export const useAcceptInvitation = () =>
  useMutation<
    AcceptInvitationResponse,
    UsersQueryError,
    AcceptInvitationRequest
  >({
    mutationFn: async (payload) => {
      try {
        return await acceptInvitation(payload)
      } catch (error) {
        throw mapActivationError(error, getAcceptErrorMessage)
      }
    },
  })
