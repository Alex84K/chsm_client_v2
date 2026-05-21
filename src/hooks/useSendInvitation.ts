import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { sendOrganizationInvitation } from '../api/users.api'
import type {
  InvitationResponse,
  SendInvitationRequest,
  UsersQueryError,
} from '../types/users.types'

type SendInvitationVariables = {
  organizationId: string
  payload: SendInvitationRequest
}

const getErrorMessage = (status?: number) => {
  if (status === 400) {
    return 'Проверьте email и выбранную роль.'
  }

  if (status === 403) {
    return 'Приглашать участников могут только администраторы или преподаватели организации.'
  }

  if (status === 409) {
    return 'На этот email уже отправлено активное приглашение в эту организацию'
  }

  return 'Не удалось отправить приглашение. Попробуйте позже.'
}

const mapInvitationError = (error: unknown): UsersQueryError => {
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

export const useSendInvitation = () =>
  useMutation<InvitationResponse, UsersQueryError, SendInvitationVariables>({
    mutationFn: async ({ organizationId, payload }) => {
      try {
        return await sendOrganizationInvitation(organizationId, payload)
      } catch (error) {
        throw mapInvitationError(error)
      }
    },
  })
